import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const counselorId = user?.id || '00000000-0000-0000-0000-000000000003';
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
      .eq('assigned_counselor_id', counselorId)
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
