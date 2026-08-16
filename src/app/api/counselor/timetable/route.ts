import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const counselorId = user?.id || '00000000-0000-0000-0000-000000000003';
    const adminClient = createAdminClient();

    // Fetch sessions assigned to counselor
    const { data: sessions, error } = await adminClient
      .from('counseling_sessions')
      .select(`
        *,
        student:students(
          id, lrn, first_name, last_name, grade_level, section, photo_url, profile_status
        )
      `)
      .eq('counselor_id', counselorId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also fetch incomplete stubs count for counselor's attention banner
    const { count: pendingStubsCount } = await adminClient
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_counselor_id', counselorId)
      .eq('profile_status', 'stub');

    return NextResponse.json({
      sessions: sessions || [],
      pendingStubsCount: pendingStubsCount || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
