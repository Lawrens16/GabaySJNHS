import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/server';
import { signOfficerToken, OFFICER_SESSION_DURATION_SECONDS } from '@/lib/auth/officer-jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, pin } = body;

    if (!username || !pin) {
      return NextResponse.json(
        { error: 'Username and 6-digit PIN are required.' },
        { status: 400 }
      );
    }

    if (typeof pin !== 'string' || pin.trim().length !== 6) {
      return NextResponse.json(
        { error: 'PIN must be a valid 6-digit number.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const supabase = createAdminClient();

    // Query officer
    const { data: officer, error: dbError } = await supabase
      .from('enrollment_officers')
      .select('*')
      .eq('username', cleanUsername)
      .eq('is_active', true)
      .single();

    if (dbError || !officer) {
      return NextResponse.json(
        { error: 'Invalid username or inactive officer account.' },
        { status: 401 }
      );
    }

    // Check expiration date
    if (new Date(officer.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: 'This officer account has expired. Please contact the IT Admin.' },
        { status: 403 }
      );
    }

    // Verify PIN with bcrypt (extracts hash portion if stored in dual format)
    const bcryptHash = officer.pin_hash && officer.pin_hash.includes('::')
      ? officer.pin_hash.split('::')[0]
      : officer.pin_hash;

    const isMatch = bcrypt.compareSync(pin.trim(), bcryptHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid 6-digit PIN.' },
        { status: 401 }
      );
    }

    // Sign 10-hour JWT
    const token = await signOfficerToken({
      id: officer.id,
      username: officer.username,
      full_name: officer.full_name,
    });

    // Update last_login_at
    await supabase
      .from('enrollment_officers')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', officer.id);

    const response = NextResponse.json({
      success: true,
      officer: {
        id: officer.id,
        username: officer.username,
        full_name: officer.full_name,
      },
      expiresInSeconds: OFFICER_SESSION_DURATION_SECONDS,
    });

    // Set Strict 10-Hour HTTP-only cookie
    response.cookies.set('eo_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: OFFICER_SESSION_DURATION_SECONDS,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication error.' },
      { status: 500 }
    );
  }
}
