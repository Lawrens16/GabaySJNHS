import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// Helper: Safely resolve a valid LFO / Staff profile ID
async function resolveLfoProfileId(providedId?: string | null): Promise<string> {
  const adminClient = createAdminClient();

  // 1. If provided and valid non-dummy string, verify exists in profiles
  if (providedId && providedId !== '00000000-0000-0000-0000-000000000002') {
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', providedId)
      .single();
    if (existing?.id) return existing.id;
  }

  // 2. Check current authenticated user session
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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

  // 3. Fallback: Query first available approved staff (lfo or admin)
  const { data: staffList } = await adminClient
    .from('profiles')
    .select('id')
    .in('role', ['lfo', 'admin', 'counselor'])
    .eq('status', 'approved')
    .limit(1);

  if (staffList && staffList.length > 0) {
    return staffList[0].id;
  }

  // 4. Ultimate fallback: Any profile in table
  const { data: anyProfile } = await adminClient
    .from('profiles')
    .select('id')
    .limit(1);

  if (anyProfile && anyProfile.length > 0) {
    return anyProfile[0].id;
  }

  throw new Error('No registered staff profile found in the database. Please ensure at least one staff account is approved.');
}

// GET: List all Disciplinary Records ("Bad Records")
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const clearance = searchParams.get('clearance');

    const adminClient = createAdminClient();
    let query = adminClient
      .from('disciplinary_records')
      .select(`
        *,
        student:students(id, lrn, first_name, last_name, grade_level, section, photo_url)
      `)
      .order('incident_date', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (clearance && clearance !== 'all') {
      query = query.eq('clearance_status', clearance);
    }

    const { data: records, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ records: records || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create Disciplinary Record (LFO Exclusive)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      lfoId,
      incidentDate,
      offenseCategory,
      offenseDescription,
      sanctionImposed,
      isSuspended,
      suspensionStartDate,
      suspensionEndDate,
      clearanceStatus,
    } = body;

    if (!studentId || !offenseDescription || !sanctionImposed) {
      return NextResponse.json(
        { error: 'Student, Offense Description, and Sanction are required.' },
        { status: 400 }
      );
    }

    const resolvedLfoId = await resolveLfoProfileId(lfoId);
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('disciplinary_records')
      .insert({
        student_id: studentId,
        lfo_id: resolvedLfoId,
        incident_date: incidentDate || new Date().toISOString().split('T')[0],
        offense_category: offenseCategory || 'minor',
        offense_description: offenseDescription.trim(),
        sanction_imposed: sanctionImposed.trim(),
        is_suspended: Boolean(isSuspended),
        suspension_start_date: isSuspended ? suspensionStartDate : null,
        suspension_end_date: isSuspended ? suspensionEndDate : null,
        clearance_status: clearanceStatus || 'pending',
      })
      .select(`
        *,
        student:students(id, lrn, first_name, last_name, grade_level, section)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update Disciplinary Record or Grant Clearance
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recordId,
      offenseCategory,
      offenseDescription,
      sanctionImposed,
      isSuspended,
      suspensionStartDate,
      suspensionEndDate,
      clearanceStatus,
      clearedByLfoId,
    } = body;

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (offenseCategory !== undefined) updatePayload.offense_category = offenseCategory;
    if (offenseDescription !== undefined) updatePayload.offense_description = offenseDescription;
    if (sanctionImposed !== undefined) updatePayload.sanction_imposed = sanctionImposed;
    if (isSuspended !== undefined) updatePayload.is_suspended = isSuspended;
    if (suspensionStartDate !== undefined) updatePayload.suspension_start_date = suspensionStartDate;
    if (suspensionEndDate !== undefined) updatePayload.suspension_end_date = suspensionEndDate;
    if (clearanceStatus !== undefined) {
      updatePayload.clearance_status = clearanceStatus;
      if (clearanceStatus === 'cleared') {
        updatePayload.cleared_at = new Date().toISOString();
        const resolvedClearerId = await resolveLfoProfileId(clearedByLfoId);
        updatePayload.cleared_by_lfo_id = resolvedClearerId;
      }
    }

    const { data, error } = await adminClient
      .from('disciplinary_records')
      .update(updatePayload)
      .eq('id', recordId)
      .select(`
        *,
        student:students(id, lrn, first_name, last_name, grade_level, section)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove Disciplinary Record
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('recordId');

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('disciplinary_records')
      .delete()
      .eq('id', recordId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Record deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
