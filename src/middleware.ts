import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { jwtVerify } from 'jose';

const OFFICER_SECRET = new TextEncoder().encode(
  process.env.OFFICER_JWT_SECRET || 'gabay-sjnhs-default-officer-secret-key-2026'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static and Public Route Bypasses
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/api/auth/officer-login') ||
    pathname.startsWith('/api/auth/officer-logout')
  ) {
    return NextResponse.next();
  }

  // 2. Enrollment Officer Routes Gate (/officer/*)
  if (pathname.startsWith('/officer')) {
    if (pathname === '/officer/login') {
      return NextResponse.next();
    }

    const officerCookie = request.cookies.get('eo_session')?.value;
    if (!officerCookie) {
      return NextResponse.redirect(
        new URL('/officer/login?error=session_required', request.url)
      );
    }

    try {
      const { payload } = await jwtVerify(officerCookie, OFFICER_SECRET, {
        algorithms: ['HS256'],
      });

      if (payload.app_role !== 'enrollment_officer') {
        const res = NextResponse.redirect(new URL('/officer/login?error=unauthorized', request.url));
        res.cookies.delete('eo_session');
        return res;
      }

      // Valid 10-hour officer session
      const reqHeaders = new Headers(request.headers);
      reqHeaders.set('x-officer-id', (payload.sub as string) || '');
      reqHeaders.set('x-officer-name', (payload.name as string) || '');
      return NextResponse.next({ request: { headers: reqHeaders } });
    } catch {
      // Expired (>10h) or invalid token
      const res = NextResponse.redirect(
        new URL('/officer/login?error=session_expired', request.url)
      );
      res.cookies.delete('eo_session');
      return res;
    }
  }

  // 3. Core Staff Routes Gate (Supabase Auth: Admin, LFO, Counselor)
  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (!user) {
    // Redirect unauthenticated staff to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Fetch user profile status & role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  const status = profile?.status || 'pending';
  const role = profile?.role;

  // Handle pending users
  if (status === 'pending') {
    if (pathname !== '/approval-pending') {
      return NextResponse.redirect(new URL('/approval-pending', request.url));
    }
    return supabaseResponse;
  }

  // Handle rejected or suspended users
  if (status === 'rejected' || status === 'suspended') {
    if (pathname !== '/access-denied') {
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
    return supabaseResponse;
  }

  // Approved users shouldn't stay on approval-pending
  if (pathname === '/approval-pending') {
    if (role === 'counselor') return NextResponse.redirect(new URL('/counselor/timetable', request.url));
    if (role === 'lfo') return NextResponse.redirect(new URL('/lfo/dashboard', request.url));
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/approval-queue', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Role Gating
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/access-denied?reason=admin_required', request.url));
  }

  if (pathname.startsWith('/lfo') && role !== 'lfo' && role !== 'admin') {
    return NextResponse.redirect(new URL('/access-denied?reason=lfo_required', request.url));
  }

  if (pathname.startsWith('/counselor') && role !== 'counselor' && role !== 'admin') {
    return NextResponse.redirect(new URL('/access-denied?reason=counselor_required', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
