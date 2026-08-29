import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/server';

// GET: List all Enrollment Officers
export async function GET() {
  try {
    const adminClient = createAdminClient();

    // First attempt selecting with pin_code column
    let officers: any = null;
    const initialQuery = await adminClient
      .from('enrollment_officers')
      .select('id, username, full_name, pin_code, is_active, expires_at, created_by, last_login_at, created_at')
      .order('created_at', { ascending: false });

    let error = initialQuery.error;
    officers = initialQuery.data;

    // Fallback if pin_code column does not exist yet
    if (error && error.message.includes('pin_code')) {
      const fallback = await adminClient
        .from('enrollment_officers')
        .select('id, username, full_name, is_active, expires_at, created_by, last_login_at, created_at')
        .order('created_at', { ascending: false });

      officers = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ officers: officers || [] });
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
    const pinHash = bcrypt.hashSync(pin, 10);
    const expirationDate = expiresAt
      ? new Date(expiresAt).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Default 30 days

    const adminClient = createAdminClient();

    // Attempt insertion with pin_code column
    let insertPayload: Record<string, any> = {
      username: cleanUsername,
      full_name: fullName.trim(),
      pin_hash: pinHash,
      pin_code: pin,
      is_active: true,
      expires_at: expirationDate,
    };

    let { data, error } = await adminClient
      .from('enrollment_officers')
      .insert(insertPayload)
      .select('id, username, full_name, pin_code, is_active, expires_at, created_at')
      .single();

    // Fallback if pin_code column does not exist yet
    if (error && error.message.includes('pin_code')) {
      delete insertPayload.pin_code;
      const fallback = await adminClient
        .from('enrollment_officers')
        .insert(insertPayload)
        .select('id, username, full_name, is_active, expires_at, created_at')
        .single();

      data = fallback.data ? { ...fallback.data, pin_code: pin } : null;
      error = fallback.error;
    }

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
      officer: data,
      rawPin: pin, // Returned once so admin can print/copy the station pass
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
      updatePayload.pin_hash = bcrypt.hashSync(newPin, 10);
      updatePayload.pin_code = newPin;
    }

    let { data, error } = await adminClient
      .from('enrollment_officers')
      .update(updatePayload)
      .eq('id', officerId)
      .select('id, username, full_name, pin_code, is_active, expires_at')
      .single();

    // Fallback if pin_code column does not exist yet
    if (error && error.message.includes('pin_code')) {
      delete updatePayload.pin_code;
      const fallback = await adminClient
        .from('enrollment_officers')
        .update(updatePayload)
        .eq('id', officerId)
        .select('id, username, full_name, is_active, expires_at')
        .single();

      data = fallback.data ? { ...fallback.data, pin_code: newPin || null } : null;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, officer: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete an Enrollment Officer
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const officerId = searchParams.get('officerId');

    if (!officerId) {
      return NextResponse.json({ error: 'Officer ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('enrollment_officers')
      .delete()
      .eq('id', officerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Enrollment officer deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
