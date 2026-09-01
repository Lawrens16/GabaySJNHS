import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/server';

// Helper to decode PIN if stored in dual hash format: `${bcryptHash}::${b64Pin}`
function extractPin(officer: any): string | null {
  if (officer.pin_code) return officer.pin_code;
  if (officer.pin_hash && typeof officer.pin_hash === 'string' && officer.pin_hash.includes('::')) {
    try {
      const b64 = officer.pin_hash.split('::')[1];
      if (b64) return Buffer.from(b64, 'base64').toString('utf-8');
    } catch {
      // Ignore
    }
  }
  return null;
}

// GET: List all Enrollment Officers
export async function GET() {
  try {
    const adminClient = createAdminClient();

    // Query non-deleted officers
    let { data: officers, error } = await adminClient
      .from('enrollment_officers')
      .select('id, username, full_name, pin_hash, is_active, expires_at, created_by, last_login_at, created_at')
      .not('username', 'like', 'deleted_%')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const sanitizedOfficers = (officers || []).map((o) => ({
      id: o.id,
      username: o.username,
      full_name: o.full_name,
      pin_code: extractPin(o),
      is_active: o.is_active,
      expires_at: o.expires_at,
      created_by: o.created_by,
      last_login_at: o.last_login_at,
      created_at: o.created_at,
    }));

    return NextResponse.json({ officers: sanitizedOfficers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Provision New Enrollment Officer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, fullName, pin, expiresAt } = body;

    if (!username || !fullName || !pin) {
      return NextResponse.json(
        { error: 'Username, Full Name, and 6-digit PIN are required.' },
        { status: 400 }
      );
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 6 numeric digits.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    // Dual storage: bcrypt hash + base64 reversible PIN in TEXT column
    const bcryptHash = bcrypt.hashSync(pin, 10);
    const b64Pin = Buffer.from(pin).toString('base64');
    const combinedPinHash = `${bcryptHash}::${b64Pin}`;

    const expirationDate = expiresAt
      ? new Date(expiresAt).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default 30 days

    const adminClient = createAdminClient();

    let insertPayload: Record<string, any> = {
      username: cleanUsername,
      full_name: fullName.trim(),
      pin_hash: combinedPinHash,
      is_active: true,
      expires_at: expirationDate,
    };

    let { data, error } = await adminClient
      .from('enrollment_officers')
      .insert(insertPayload)
      .select('id, username, full_name, is_active, expires_at, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Username already exists. Please choose a unique username.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      officer: {
        ...data,
        pin_code: pin,
      },
      rawPin: pin,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Revoke / Toggle Access or Reset PIN
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { officerId, isActive, newPin } = body;

    if (!officerId) {
      return NextResponse.json({ error: 'Officer ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const updatePayload: Record<string, any> = {};

    if (isActive !== undefined) {
      updatePayload.is_active = isActive;
    }

    if (newPin) {
      if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
        return NextResponse.json(
          { error: 'PIN must be exactly 6 numeric digits.' },
          { status: 400 }
        );
      }
      const bcryptHash = bcrypt.hashSync(newPin, 10);
      const b64Pin = Buffer.from(newPin).toString('base64');
      updatePayload.pin_hash = `${bcryptHash}::${b64Pin}`;
    }

    let { data, error } = await adminClient
      .from('enrollment_officers')
      .update(updatePayload)
      .eq('id', officerId)
      .select('id, username, full_name, pin_hash, is_active, expires_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      officer: {
        ...data,
        pin_code: extractPin(data),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete or Soft-Delete an Enrollment Officer (Preserves Station Audit Logs)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const officerId = searchParams.get('officerId');

    if (!officerId) {
      return NextResponse.json({ error: 'Officer ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check if officer has audit logs
    const { data: auditLogs } = await adminClient
      .from('officer_access_logs')
      .select('id')
      .eq('officer_id', officerId)
      .limit(1);

    if (auditLogs && auditLogs.length > 0) {
      // Soft-delete to preserve audit trail integrity
      const { data: currentOfficer } = await adminClient
        .from('enrollment_officers')
        .select('username, full_name')
        .eq('id', officerId)
        .single();

      const origUsername = currentOfficer?.username || 'officer';
      const origName = currentOfficer?.full_name || 'Enrollment Officer';

      const { error } = await adminClient
        .from('enrollment_officers')
        .update({
          is_active: false,
          username: `deleted_${Date.now()}_${origUsername}`,
          full_name: `${origName} (Removed)`,
        })
        .eq('id', officerId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Officer removed and historical audit logs preserved.',
      });
    }

    // If no audit logs exist, delete row completely
    const { error } = await adminClient
      .from('enrollment_officers')
      .delete()
      .eq('id', officerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment officer deleted successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
