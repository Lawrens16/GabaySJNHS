import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check user profile to redirect directly to appropriate dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .single();

        if (!profile || profile.status === 'pending') {
          return NextResponse.redirect(`${origin}/approval-pending`);
        }

        if (profile.status === 'approved') {
          // One-time multi-role exception: redirect to workspace selector
          // This is intentionally hardcoded for a single known dual-role user.
          if (user.email === 'lucille.magnetico5300@deped.gov.ph') {
            return NextResponse.redirect(`${origin}/role-select`);
          }

          if (profile.role === 'counselor') {
            return NextResponse.redirect(`${origin}/counselor/timetable`);
          } else if (profile.role === 'lfo') {
            return NextResponse.redirect(`${origin}/lfo/dashboard`);
          } else if (profile.role === 'admin') {
            return NextResponse.redirect(`${origin}/admin/approval-queue`);
          }
        }

        if (profile.status === 'rejected' || profile.status === 'suspended') {
          return NextResponse.redirect(`${origin}/access-denied`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login if exchange fails
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
