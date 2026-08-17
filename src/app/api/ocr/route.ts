import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // 30s timeout for OCR

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No document scan provided.', rawText: '' },
        { status: 400 }
      );
    }

    // Check payload size safety (< 1MB)
    if (file.size > 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds the 1MB OCR limit. Please compress on the client.', rawText: '' },
        { status: 413 }
      );
    }

    // Convert file buffer to base64 Data URL for robust non-streaming transmission
    const arrayBuffer = await file.arrayBuffer();
    const base64Str = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/webp';
    const base64DataUrl = `data:${mimeType};base64,${base64Str}`;

    const apiKeys = [
      process.env.OCR_SPACE_API_KEY,
      'K81653747988957',
      'K88723657388957',
      'helloworld',
    ].filter(Boolean) as string[];

    let lastError = 'OCR service was unavailable.';
    let parsedText = '';

    for (const apiKey of apiKeys) {
      try {
        const ocrPayload = new FormData();
        ocrPayload.append('base64Image', base64DataUrl);
        ocrPayload.append('language', 'eng');
        ocrPayload.append('isOverlayRequired', 'false');
        ocrPayload.append('OCREngine', '2'); // Engine 2 is optimized for handwriting
        ocrPayload.append('scale', 'true');
        ocrPayload.append('detectOrientation', 'true');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout per key attempt

        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            apikey: apiKey,
          },
          body: ocrPayload,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!ocrResponse.ok) {
          lastError = `OCR Service returned HTTP ${ocrResponse.status}`;
          continue;
        }

        const data = await ocrResponse.json();

        if (data.IsErroredOnProcessing) {
          lastError = data.ErrorMessage?.[0] || 'Handwriting recognition encountered an issue.';
          continue;
        }

        parsedText = data.ParsedResults?.[0]?.ParsedText || '';
        break; // Successfully got response
      } catch (err: any) {
        lastError = err.name === 'AbortError' ? 'OCR service timed out after 12s.' : (err.message || 'Connection error');
      }
    }

    if (!parsedText && lastError) {
      return NextResponse.json({
        success: false,
        error: lastError,
        rawText: '',
      });
    }

    return NextResponse.json({
      success: true,
      rawText: parsedText.trim(),
    });
  } catch (error: any) {
    console.error('OCR Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal OCR processing error.', rawText: '' },
      { status: 200 }
    );
  }
}
