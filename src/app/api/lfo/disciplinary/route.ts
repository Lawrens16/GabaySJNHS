import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('disciplinary_records')
      .insert({
        student_id: studentId,
        lfo_id: lfoId || '00000000-0000-0000-0000-000000000002',
        incident_date: incidentDate || new Date().toISOString().split('T')[0],
        offense_category: offenseCategory || 'minor',
        offense_description: offenseDescription.trim(),
        sanction_imposed: sanctionImposed.trim(),
        is_suspended: isSuspended || false,
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
        if (clearedByLfoId) updatePayload.cleared_by_lfo_id = clearedByLfoId;
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
