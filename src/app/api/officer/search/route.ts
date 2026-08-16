import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyOfficerToken } from '@/lib/auth/officer-jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('eo_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Officer session required' }, { status: 401 });
    }

    const payload = await verifyOfficerToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Session expired or invalid' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const adminClient = createAdminClient();

    let studentQuery = adminClient
      .from('students')
      .select(`
        id,
        lrn,
        first_name,
        last_name,
        middle_name,
        grade_level,
        section,
        photo_url,
        profile_status,
        disciplinary_records(
          id,
          offense_category,
          offense_description,
          sanction_imposed,
          is_suspended,
          suspension_start_date,
          suspension_end_date,
          clearance_status
        )
      `)
      .order('last_name', { ascending: true })
      .limit(30);

    if (query.trim()) {
      studentQuery = studentQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,lrn.ilike.%${query}%`
      );
    }

    const { data: students, error } = await studentQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ students: students || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
