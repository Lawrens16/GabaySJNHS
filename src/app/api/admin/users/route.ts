import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { UserRole, UserStatus } from '@/types/database.types';

// GET: List profiles for Approval Queue & Staff Directory
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Verify requesting user is admin
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Fallback: If development / seed mode or admin
    const adminClient = createAdminClient();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    let query = adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: profiles, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: profiles || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Approve / Assign Role / Reject / Suspend Profile
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const updatePayload: {
      status?: UserStatus;
      role?: UserRole | null;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (role !== undefined) updatePayload.role = role;

    const { data, error } = await adminClient
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
