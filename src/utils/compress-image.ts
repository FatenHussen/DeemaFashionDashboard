/**
 * Compress an image File using canvas.
 * Returns a new File with reduced size while maintaining acceptable quality.
 * Falls back to the original file on any error or timeout.
 */
export async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number; timeout?: number } = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8, timeout = 10000 } = options;

  // Skip non-image files
  if (!file.type.startsWith('image/')) return file;

  // Keep animation / vector formats intact (re-encoding would break them).
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  // Skip already small files (< 200KB)
  if (file.size < 200 * 1024) return file;

  const compressionPromise = new Promise<File>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if exceeds max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const sizeReduction = ((file.size - blob.size) / file.size * 100).toFixed(1);
          console.log(`[Compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB (-${sizeReduction}%)`);
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });

  // Race against timeout — if compression hangs, return original file
  const timeoutPromise = new Promise<File>((resolve) => {
    setTimeout(() => {
      console.warn(`[Compress] Timeout for ${file.name}, using original`);
      resolve(file);
    }, timeout);
  });

  return Promise.race([compressionPromise, timeoutPromise]);
}

/**
 * Compress multiple image files in parallel.
 */
export async function compressImages(
  files: File[],
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<File[]> {
  if (!files.length) return files;
  console.log(`[Compress] Compressing ${files.length} image(s)...`);
  const result = await Promise.all(files.map((f) => compressImage(f, options)));
  console.log(`[Compress] Done compressing ${result.length} image(s)`);
  return result;
}
