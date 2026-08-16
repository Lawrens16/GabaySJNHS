import { NextRequest, NextResponse } from 'next/server';
import { verifyOfficerToken } from '@/lib/auth/officer-jwt';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('eo_session')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifyOfficerToken(token);
  if (!payload || !payload.exp) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const remainingSeconds = Math.max(0, payload.exp - nowSeconds);

  return NextResponse.json({
    authenticated: true,
    officer: {
      id: payload.sub,
      username: payload.username,
      name: payload.name,
    },
    remainingSeconds,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  });
}
