import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    const adminClient = createAdminClient();

    const { data: session, error } = await adminClient
      .from('counseling_sessions')
      .insert({
        student_id: studentId,
        counselor_id: counselorId || '00000000-0000-0000-0000-000000000003',
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
