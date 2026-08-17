import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

// Helper: Safely resolve a valid Counselor profile ID
async function resolveCounselorProfileId(providedId?: string | null): Promise<string> {
  const adminClient = createAdminClient();

  if (providedId && providedId !== '00000000-0000-0000-0000-000000000003') {
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', providedId)
      .single();
    if (existing?.id) return existing.id;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      const { data: userProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (userProfile?.id) return userProfile.id;
    }
  } catch {
    // Continue fallback
  }

  const { data: staffList } = await adminClient
    .from('profiles')
    .select('id')
    .in('role', ['counselor', 'admin', 'lfo'])
    .eq('status', 'approved')
    .limit(1);

  if (staffList && staffList.length > 0) {
    return staffList[0].id;
  }

  const { data: anyProfile } = await adminClient
    .from('profiles')
    .select('id')
    .limit(1);

  if (anyProfile && anyProfile.length > 0) {
    return anyProfile[0].id;
  }

  throw new Error('No registered staff or counselor profile found.');
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const adminClient = createAdminClient();
    let query = adminClient
      .from('students')
      .select(`
        *,
        disciplinary_records(id, offense_category, is_suspended, clearance_status)
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('profile_status', status);
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,lrn.ilike.%${search}%`
      );
    }

    const { data: students, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ students: students || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
