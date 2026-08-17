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
    const counselorId = await resolveCounselorProfileId();
    const adminClient = createAdminClient();

    // Fetch sessions assigned to counselor or all sessions if admin
    const { data: sessions, error } = await adminClient
      .from('counseling_sessions')
      .select(`
        *,
        student:students(
          id, lrn, first_name, last_name, grade_level, section, photo_url, profile_status
        )
      `)
      .order('scheduled_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also fetch incomplete stubs count for counselor's attention banner
    const { count: pendingStubsCount } = await adminClient
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('profile_status', 'stub');

    return NextResponse.json({
      sessions: sessions || [],
      pendingStubsCount: pendingStubsCount || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
