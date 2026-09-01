import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET: List students with counselor and disciplinary relations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const adminClient = createAdminClient();
    let query = adminClient
      .from('students')
      .select(`
        *,
        assigned_counselor:profiles!students_assigned_counselor_id_fkey(id, full_name, email, avatar_url),
        disciplinary_records(id, offense_category, is_suspended, clearance_status, incident_date)
      `)
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

// POST: Create a Student Stub (LFO Dispatcher)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lrn,
      firstName,
      lastName,
      middleName,
      gradeLevel,
      section,
      gender,
      assignedCounselorId,
      createdById,
      evidenceUrls,
      evidenceNotes,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Student First Name and Last Name are required.' },
        { status: 400 }
      );
    }

    if (lrn && lrn.trim().length !== 12) {
      return NextResponse.json(
        { error: 'LRN must be exactly 12 digits.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const { data: student, error } = await adminClient
      .from('students')
      .insert({
        lrn: lrn ? lrn.trim() : null,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName ? middleName.trim() : null,
        grade_level: gradeLevel ? parseInt(gradeLevel, 10) : null,
        section: section ? section.trim() : null,
        gender: gender || null,
        profile_status: 'stub',
        assigned_counselor_id: assignedCounselorId || null,
        created_by_lfo_id: createdById || null,
        stub_evidence_urls: evidenceUrls && evidenceUrls.length > 0 ? evidenceUrls : [],
        stub_evidence_notes: evidenceNotes ? evidenceNotes.trim() : null,
      })
      .select(`
        *,
        assigned_counselor:profiles!students_assigned_counselor_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Reassign Counselor or Edit Stub Details
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, assignedCounselorId, gradeLevel, section } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (assignedCounselorId !== undefined) updatePayload.assigned_counselor_id = assignedCounselorId;
    if (gradeLevel !== undefined) updatePayload.grade_level = gradeLevel ? parseInt(gradeLevel, 10) : null;
    if (section !== undefined) updatePayload.section = section;

    const { data, error } = await adminClient
      .from('students')
      .update(updatePayload)
      .eq('id', studentId)
      .select(`
        *,
        assigned_counselor:profiles!students_assigned_counselor_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, student: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
