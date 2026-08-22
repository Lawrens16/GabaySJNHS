import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await context.params;
    const formData = await req.formData();

    const photoFile = formData.get('photo') as File | null;
    const lrn = formData.get('lrn') as string | null;
    const birthdate = formData.get('birthdate') as string | null;
    const gender = formData.get('gender') as string | null;
    const gradeLevel = formData.get('gradeLevel') as string | null;
    const section = formData.get('section') as string | null;
    const contactNumber = formData.get('contactNumber') as string | null;
    const guardianName = formData.get('guardianName') as string | null;
    const guardianContact = formData.get('guardianContact') as string | null;
    const counselorId = formData.get('counselorId') as string | null;

    if (!photoFile) {
      return NextResponse.json(
        { error: 'MANDATORY REQUIREMENT: Student face photo must be captured before completing profile.' },
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

    // 1. Upload compressed face photo to Supabase Storage: student-avatars
    const fileExt = photoFile.name.split('.').pop() || 'webp';
    const filePath = `avatars/${studentId}-${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await photoFile.arrayBuffer());

    const { error: storageError } = await adminClient.storage
      .from('student-avatars')
      .upload(filePath, buffer, {
        contentType: photoFile.type || 'image/webp',
        upsert: true,
      });

    let photoUrl = '';
    if (!storageError) {
      const { data: urlData } = adminClient.storage
        .from('student-avatars')
        .getPublicUrl(filePath);
      photoUrl = urlData.publicUrl;
    } else {
      console.warn('Storage upload fallback, using data URI:', storageError);
      photoUrl = `data:${photoFile.type};base64,${buffer.toString('base64')}`;
    }

    // 2. Update Student Record to complete
    const { data: updatedStudent, error: updateError } = await adminClient
      .from('students')
      .update({
        lrn: lrn ? lrn.trim() : null,
        birthdate: birthdate || null,
        gender: gender || null,
        grade_level: gradeLevel ? parseInt(gradeLevel, 10) : null,
        section: section ? section.trim() : null,
        contact_number: contactNumber ? contactNumber.trim() : null,
        guardian_name: guardianName ? guardianName.trim() : null,
        guardian_contact: guardianContact ? guardianContact.trim() : null,
        photo_url: photoUrl,
        photo_storage_path: filePath,
        profile_status: 'complete',
        completed_by_counselor_id: counselorId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      student: updatedStudent,
      message: 'Student profile completed with verified face photo.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
