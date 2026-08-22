import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/server';

// GET: List all Enrollment Officers
export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data: officers, error } = await adminClient
      .from('enrollment_officers')
      .select('id, username, full_name, is_active, expires_at, created_by, last_login_at, created_at')
      .order('created_at', { ascending: false });

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

    const { data, error } = await adminClient
      .from('enrollment_officers')
      .insert({
        username: cleanUsername,
        full_name: fullName.trim(),
        pin_hash: pinHash,
        is_active: true,
        expires_at: expirationDate,
      })
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
      officer: data,
      rawPin: pin, // Returned once so admin can print/copy the station pass
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Revoke or Toggle Officer Access
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { officerId, isActive } = body;

    if (!officerId) {
      return NextResponse.json({ error: 'Officer ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('enrollment_officers')
      .update({ is_active: isActive })
      .eq('id', officerId)
      .select('id, username, full_name, is_active, expires_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, officer: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
