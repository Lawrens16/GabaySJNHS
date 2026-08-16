import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const studentId = formData.get('studentId') as string | null;
    const counselorId = formData.get('counselorId') as string | null;
    const ocrRaw = formData.get('ocrRaw') as string || '';
    const counselorEdited = formData.get('counselorEdited') as string || '';
    const sessionType = formData.get('sessionType') as string || 'routine';

    if (!imageFile || !studentId || !counselorEdited) {
      return NextResponse.json(
        { error: 'Image scan, student ID, and note text are required.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const noteId = crypto.randomUUID();
    const fileExt = imageFile.name.split('.').pop() || 'webp';
    const storagePath = `notes/${studentId}/${noteId}.${fileExt}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // 1. Upload scan to counseling-documents storage
    const { error: storageError } = await adminClient.storage
      .from('counseling-documents')
      .upload(storagePath, buffer, {
        contentType: imageFile.type || 'image/webp',
        upsert: true,
      });

    let imageUrl = '';
    if (!storageError) {
      const { data: urlData } = adminClient.storage
        .from('counseling-documents')
        .getPublicUrl(storagePath);
      imageUrl = urlData.publicUrl;
    } else {
      imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
    }

    // 2. Insert into counseling_notes
    const { data: note, error: insertError } = await adminClient
      .from('counseling_notes')
      .insert({
        id: noteId,
        student_id: studentId,
        counselor_id: counselorId || '00000000-0000-0000-0000-000000000003',
        image_url: imageUrl,
        image_storage_path: storagePath,
        ocr_raw_text: ocrRaw,
        counselor_edited_text: counselorEdited,
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
