const ICON_MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

export function iconUploadMime(filename: string, fallbackType = ''): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ICON_MIME_BY_EXT[ext]) return ICON_MIME_BY_EXT[ext];
  if (fallbackType.startsWith('image/')) return fallbackType;
  return fallbackType || 'application/octet-stream';
}

export function isIconDataUrl(value: string | null | undefined): value is string {
  return !!value && value.startsWith('data:') && value.includes(';base64,');
}

/** Copy the bytes out of the picker immediately. The live `input.files` entry can be empty later. */
export async function snapshotIconFile(file: File): Promise<File | null> {
  if (!(file instanceof File) || file.size <= 0) return null;
  const filename = file.name || 'icon.webp';
  const bytes = await file.arrayBuffer();
  if (!bytes.byteLength) return null;
  return new File([bytes], filename, {
    type: iconUploadMime(filename, file.type),
    lastModified: file.lastModified,
  });
}

export async function fileFromIconDataUrl(dataUrl: string, filename: string): Promise<File | null> {
  if (!isIconDataUrl(dataUrl)) return null;
  const response = await fetch(dataUrl);
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength) return null;
  const name = filename || 'icon.webp';
  return new File([bytes], name, { type: iconUploadMime(name) });
}
