/** Uppercase alphanumeric, excludes ambiguous 0/O and 1/I. */
function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[bytes[i]! % chars.length];
  }
  return out;
}

/** Generates a random SKU like `SKU-AB12CD34`. */
export function generateRandomSku(length = 8): string {
  return `SKU-${randomAlphanumeric(length)}`;
}
