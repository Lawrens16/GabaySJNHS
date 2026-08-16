import { describe, it } from 'node:test';
import assert from 'node:assert';
import { signOfficerToken, verifyOfficerToken, OFFICER_SESSION_DURATION_SECONDS } from '../src/lib/auth/officer-jwt';

describe('Enrollment Officer 10-Hour JWT Authentication', () => {
  it('should enforce exactly 10 hours (36,000 seconds) session duration', () => {
    assert.strictEqual(OFFICER_SESSION_DURATION_SECONDS, 36000);
  });

  it('should sign and verify valid officer token with custom claim', async () => {
    const officer = {
      id: '11111111-1111-1111-1111-111111111111',
      username: 'eo_santos',
      full_name: 'Maria Santos',
    };

    const token = await signOfficerToken(officer);
    assert.ok(token && typeof token === 'string');

    const payload = await verifyOfficerToken(token);
    assert.ok(payload);
    assert.strictEqual(payload.sub, officer.id);
    assert.strictEqual(payload.username, officer.username);
    assert.strictEqual(payload.name, officer.full_name);
    assert.strictEqual(payload.app_role, 'enrollment_officer');
    assert.ok(payload.exp && payload.iat);
    assert.strictEqual(payload.exp - payload.iat, 36000);
  });

  it('should reject invalid or tampered JWT token', async () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    const payload = await verifyOfficerToken(invalidToken);
    assert.strictEqual(payload, null);
  });
});
