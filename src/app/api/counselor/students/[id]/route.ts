import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    // Resolve secure signed URLs for all note attachments from the private counseling-documents bucket
    const notesWithSignedUrls = await Promise.all(
      (notesRes.data || []).map(async (note) => {
        let resolvedImageUrl = note.image_url;

        if (note.image_storage_path) {
          const { data: signed } = await adminClient.storage
            .from('counseling-documents')
            .createSignedUrl(note.image_storage_path, 60 * 60 * 24); // 24 hours
          if (signed?.signedUrl) {
            resolvedImageUrl = signed.signedUrl;
          }
        } else if (note.image_url && note.image_url.includes('counseling-documents/')) {
          const extractedPath = note.image_url.split('counseling-documents/').pop();
          if (extractedPath) {
            const { data: signed } = await adminClient.storage
              .from('counseling-documents')
              .createSignedUrl(extractedPath, 60 * 60 * 24);
            if (signed?.signedUrl) {
              resolvedImageUrl = signed.signedUrl;
            }
          }
        }

        return {
          ...note,
          image_url: resolvedImageUrl,
        };
      })
    );

    return NextResponse.json({
      student: studentRes.data,
      notes: notesWithSignedUrls,
      sessions: sessionsRes.data || [],
      disciplinaryRecords: disciplinaryRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
