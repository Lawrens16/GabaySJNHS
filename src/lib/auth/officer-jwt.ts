import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.OFFICER_JWT_SECRET || 'gabay-sjnhs-default-officer-secret-key-2026'
);

export const OFFICER_SESSION_DURATION_SECONDS = 10 * 60 * 60; // Exactly 10 Hours (36,000 seconds)

export interface OfficerJWTPayload {
  sub: string; // Officer UUID
  username: string;
  name: string;
  app_role: 'enrollment_officer';
  iat?: number;
  exp?: number;
}

/**
 * Signs a JWT specifically for a Seasonal Enrollment Officer with a strict 10-hour lifetime.
 */
export async function signOfficerToken(officer: {
  id: string;
  username: string;
  full_name: string;
}): Promise<string> {
  return await new SignJWT({
    username: officer.username,
    name: officer.full_name,
    app_role: 'enrollment_officer',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(officer.id)
    .setIssuedAt()
    .setExpirationTime(`${OFFICER_SESSION_DURATION_SECONDS}s`)
    .sign(JWT_SECRET);
}

/**
 * Verifies the Enrollment Officer JWT and checks that the token has not expired.
 */
export async function verifyOfficerToken(token: string): Promise<OfficerJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (payload.app_role !== 'enrollment_officer' || !payload.sub) {
      return null;
    }

    return payload as unknown as OfficerJWTPayload;
  } catch {
    return null;
  }
}
