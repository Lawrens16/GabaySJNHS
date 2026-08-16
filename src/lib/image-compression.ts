import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  previewUrl: string;
}

/**
 * Compresses student face portraits for ID verification.
 * Target: < 200KB, Max resolution 800x800, WebP format.
 */
export async function compressStudentAvatar(imageFile: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(imageFile.size / 1024);

  const options = {
    maxSizeMB: 0.2, // 200 KB
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  };

  try {
    const compressedBlob = await imageCompression(imageFile, options);
    const compressedFile = new File(
      [compressedBlob],
      imageFile.name.replace(/\.[^/.]+$/, '.webp'),
      { type: 'image/webp' }
    );

    const compressedSizeKB = Math.round(compressedFile.size / 1024);
    const previewUrl = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      originalSizeKB,
      compressedSizeKB,
      previewUrl,
    };
  } catch (err) {
    console.warn('Compression failed, using original file:', err);
    return {
      file: imageFile,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      previewUrl: URL.createObjectURL(imageFile),
    };
  }
}

/**
 * Compresses physical handwritten counseling note scans for OCR extraction.
 * Target: < 500KB (safely below 1MB OCR.Space free tier limit), Max width 1800px.
 */
export async function compressCounselingNoteScan(imageFile: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(imageFile.size / 1024);

  const options = {
    maxSizeMB: 0.5, // 500 KB (Guarantees zero-cost OCR.Space 1MB free limit)
    maxWidthOrHeight: 1800, // Preserves handwriting stroke contrast
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.88,
  };

  try {
    const compressedBlob = await imageCompression(imageFile, options);
    const compressedFile = new File(
      [compressedBlob],
      imageFile.name.replace(/\.[^/.]+$/, '.webp'),
      { type: 'image/webp' }
    );

    const compressedSizeKB = Math.round(compressedFile.size / 1024);
    const previewUrl = URL.createObjectURL(compressedFile);

    return {
      file: compressedFile,
      originalSizeKB,
      compressedSizeKB,
      previewUrl,
    };
  } catch (err) {
    console.warn('Compression fallback:', err);
    return {
      file: imageFile,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      previewUrl: URL.createObjectURL(imageFile),
    };
  }
}
