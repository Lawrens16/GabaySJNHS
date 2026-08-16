import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // 30s timeout for OCR

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No document scan provided.' },
        { status: 400 }
      );
    }

    // Check payload size safety (< 1MB)
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds the 1MB free-tier OCR limit. Please compress on the client.' },
        { status: 413 }
      );
    }

    const apiKey = process.env.OCR_SPACE_API_KEY || 'K88723657388957'; // OCR.Space Free Key

    const ocrPayload = new FormData();
    ocrPayload.append('file', file, 'handwritten-note.webp');
    ocrPayload.append('language', 'eng');
    ocrPayload.append('isOverlayRequired', 'false');
    ocrPayload.append('OCREngine', '2'); // Engine 2 is optimized for handwriting
    ocrPayload.append('detectOrientation', 'true');
    ocrPayload.append('scale', 'true');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: apiKey,
      },
      body: ocrPayload,
    });

    if (!ocrResponse.ok) {
      return NextResponse.json(
        { error: `OCR Service returned HTTP ${ocrResponse.status}` },
        { status: 502 }
      );
    }

    const data = await ocrResponse.json();

    if (data.IsErroredOnProcessing) {
      const errorDetail = data.ErrorMessage?.[0] || 'Handwriting recognition encountered an issue.';
      return NextResponse.json(
        { error: errorDetail, rawText: '' },
        { status: 200 } // Return 200 with error note so counselor can still write manually
      );
    }

    const parsedText = data.ParsedResults?.[0]?.ParsedText || '';

    return NextResponse.json({
      success: true,
      rawText: parsedText.trim(),
      ocrExitCode: data.OCRExitCode,
    });
  } catch (error: any) {
    console.error('OCR Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal OCR processing error.', rawText: '' },
      { status: 500 }
    );
  }
}
