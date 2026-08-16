import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data: logs, error } = await adminClient
      .from('officer_access_logs')
      .select(`
        id,
        action,
        ip_address,
        accessed_at,
        officer:enrollment_officers(id, username, full_name),
        student:students(id, lrn, first_name, last_name, grade_level, section)
      `)
      .order('accessed_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
