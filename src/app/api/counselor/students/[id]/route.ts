import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await context.params;
    const adminClient = createAdminClient();

    const [studentRes, notesRes, sessionsRes, disciplinaryRes] = await Promise.all([
      adminClient
        .from('students')
        .select(`
          *,
          assigned_counselor:profiles!students_assigned_counselor_id_fkey(id, full_name, email)
        `)
        .eq('id', studentId)
        .single(),

      adminClient
        .from('counseling_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }),

      adminClient
        .from('counseling_sessions')
        .select('*')
        .eq('student_id', studentId)
        .order('scheduled_at', { ascending: false }),

      adminClient
        .from('disciplinary_records')
        .select('*')
        .eq('student_id', studentId)
        .order('incident_date', { ascending: false }),
    ]);

    if (studentRes.error || !studentRes.data) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    return NextResponse.json({
      student: studentRes.data,
      notes: notesRes.data || [],
      sessions: sessionsRes.data || [],
      disciplinaryRecords: disciplinaryRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
