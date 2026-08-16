import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const { data: counselors, error } = await adminClient
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('role', 'counselor')
      .eq('status', 'approved')
      .order('full_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ counselors: counselors || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
