import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// Helper: Safely resolve a valid Counselor profile ID
async function resolveCounselorProfileId(providedId?: string | null): Promise<string> {
  const adminClient = createAdminClient();

  if (providedId && providedId !== '00000000-0000-0000-0000-000000000003') {
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', providedId)
      .single();
    if (existing?.id) return existing.id;
  }

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

  const { data: staffList } = await adminClient
    .from('profiles')
    .select('id')
    .in('role', ['counselor', 'admin', 'lfo'])
    .eq('status', 'approved')
    .limit(1);

  if (staffList && staffList.length > 0) {
    return staffList[0].id;
  }

  const { data: anyProfile } = await adminClient
    .from('profiles')
    .select('id')
    .limit(1);

  if (anyProfile && anyProfile.length > 0) {
    return anyProfile[0].id;
  }

  throw new Error('No registered counselor profile found.');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const studentId = formData.get('studentId') as string | null;
    const counselorId = formData.get('counselorId') as string | null;
    const ocrRaw = (formData.get('ocrRaw') as string) || '';
    const counselorEdited = (formData.get('counselorEdited') as string) || '';
    const sessionType = (formData.get('sessionType') as string) || 'routine';
    const noteCategory = (formData.get('noteCategory') as string) || 'general';

    if (!studentId || !counselorEdited.trim()) {
      return NextResponse.json(
        { error: 'Student ID and note content are required.' },
        { status: 400 }
      );
    }

    const resolvedCounselorId = await resolveCounselorProfileId(counselorId);
    const adminClient = createAdminClient();
    const noteId = crypto.randomUUID();

    let imageUrl = '';
    let storagePath = '';

    // Handle image upload if a file was provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name?.split('.').pop() || 'webp';
      storagePath = `notes/${studentId}/${noteId}.${fileExt}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      const { error: storageError } = await adminClient.storage
        .from('counseling-documents')
        .upload(storagePath, buffer, {
          contentType: imageFile.type || 'image/webp',
          upsert: true,
        });

      if (!storageError) {
        const { data: urlData } = adminClient.storage
          .from('counseling-documents')
          .getPublicUrl(storagePath);
        imageUrl = urlData.publicUrl;
      } else {
        imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
      }
    }

    // Insert note into counseling_notes
    const { data: note, error: insertError } = await adminClient
      .from('counseling_notes')
      .insert({
        id: noteId,
        student_id: studentId,
        counselor_id: resolvedCounselorId,
        image_url: imageUrl,
        image_storage_path: storagePath,
        ocr_raw_text: ocrRaw,
        counselor_edited_text: counselorEdited.trim(),
        accuracy_disclaimer_acknowledged: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
