import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyOfficerToken } from '@/lib/auth/officer-jwt';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await context.params;
    const token = req.cookies.get('eo_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Officer session required' }, { status: 401 });
    }

    const payload = await verifyOfficerToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch Student (Basic profile + Photo + Disciplinary status ONLY)
    const { data: student, error: studentError } = await adminClient
      .from('students')
      .select(`
        id,
        lrn,
        first_name,
        last_name,
        middle_name,
        gender,
        birthdate,
        grade_level,
        section,
        photo_url,
        profile_status,
        guardian_name,
        guardian_contact,
        disciplinary_records(
          id,
          offense_category,
          offense_description,
          sanction_imposed,
          is_suspended,
          suspension_start_date,
          suspension_end_date,
          clearance_status,
          incident_date
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // 2. Automatically Log the Lookup in officer_access_logs
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    await adminClient.from('officer_access_logs').insert({
      officer_id: payload.sub,
      student_id: studentId,
      action: 'view_student_for_enrollment',
      ip_address: ip,
    });

    return NextResponse.json({
      student,
      officerName: payload.name,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
