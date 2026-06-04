// Magic bytes validation untuk file upload.
// Mencegah attacker bypass MIME-only check (file.type dari client bisa dipalsukan).
// File yang MIME-nya image tapi isinya bukan (mis. script PHP dengan Content-Type: image/png)
// akan ditolak.
//
// Source: IANA registered image format signatures + RFC 2387 untuk WebP.

type MagicCheck = (bytes: Uint8Array) => boolean;

// Setiap entry: validator function. Return true jika bytes cocok dengan format.
// Slice dicek dari awal buffer.
const MAGIC_SIGNATURES: Record<string, MagicCheck> = {
  "image/jpeg": (b) =>
    b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  // PNG signature (8 bytes): 89 50 4E 47 0D 0A 1A 0A
  "image/png": (b) =>
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  // WebP: RIFF....WEBP (12 bytes)
  "image/webp": (b) =>
    b.length >= 12 &&
    b[0] === 0x52 && // R
    b[1] === 0x49 && // I
    b[2] === 0x46 && // F
    b[3] === 0x46 && // F
    b[8] === 0x57 && // W
    b[9] === 0x45 && // E
    b[10] === 0x42 && // B
    b[11] === 0x50, // P
  // GIF87a atau GIF89a — 4 byte pertama "GIF8"
  "image/gif": (b) =>
    b.length >= 4 &&
    b[0] === 0x47 && // G
    b[1] === 0x49 && // I
    b[2] === 0x46 && // F
    b[3] === 0x38, // 8
};

/**
 * Verify bahwa buffer sesuai dengan claimed MIME type.
 * Hanya cek signature — tidak validasi struktur lengkap (overkill untuk upload toko).
 *
 * @returns true jika buffer signature cocok, false jika tidak dikenal atau tidak cocok.
 */
export function verifyMagicBytes(
  buffer: Uint8Array,
  claimedMime: string
): boolean {
  const check = MAGIC_SIGNATURES[claimedMime];
  if (!check) return false;
  return check(buffer);
}

/**
 * Extract MIME type dari buffer (best-effort, tanpa library eksternal).
 * Berguna jika client tidak mengirim file.type atau mengirim MIME yang salah.
 *
 * @returns MIME type jika signature dikenali, null jika tidak.
 */
export function detectMimeType(buffer: Uint8Array): string | null {
  for (const [mime, check] of Object.entries(MAGIC_SIGNATURES)) {
    if (check(buffer)) return mime;
  }
  return null;
}
