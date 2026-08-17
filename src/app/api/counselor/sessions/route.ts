import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

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

  throw new Error('No registered staff or counselor profile found in the system.');
}

// POST: Schedule a counseling session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, counselorId, scheduledAt, sessionType, summaryNotes } = body;

    if (!studentId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Student and scheduled date/time are required.' },
        { status: 400 }
      );
    }

    const resolvedCounselorId = await resolveCounselorProfileId(counselorId);
    const adminClient = createAdminClient();

    const { data: session, error } = await adminClient
      .from('counseling_sessions')
      .insert({
        student_id: studentId,
        counselor_id: resolvedCounselorId,
        scheduled_at: scheduledAt,
        session_type: sessionType || 'routine',
        status: 'scheduled',
        summary_notes: summaryNotes || null,
      })
      .select(`
        *,
        student:students(id, lrn, first_name, last_name, grade_level, section, photo_url, profile_status)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update session status (e.g. In Progress, Completed, Cancelled)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, status, summaryNotes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (summaryNotes !== undefined) updatePayload.summary_notes = summaryNotes;

    const { data: session, error } = await adminClient
      .from('counseling_sessions')
      .update(updatePayload)
      .eq('id', sessionId)
      .select(`
        *,
        student:students(id, lrn, first_name, last_name, grade_level, section, photo_url)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
