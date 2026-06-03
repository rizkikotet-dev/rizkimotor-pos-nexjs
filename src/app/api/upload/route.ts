// API: upload gambar produk.
// Simpan file ke public/uploads/, kembalikan URL path.
// Auth: ADMIN only.
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Tipe file tidak didukung: ${file.type || "unknown"}. Gunakan JPG, PNG, WebP, atau GIF.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return NextResponse.json(
        { error: `File terlalu besar (${sizeMB} MB). Maksimal 5 MB.` },
        { status: 400 }
      );
    }

    // Generate unique filename: timestamp + random hex
    const ext = EXT_MAP[file.type] || "jpg";
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;

    // Pastikan direktori ada
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Tulis file
    const filepath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${safeName}`,
      filename: safeName,
      size: file.size,
      type: file.type,
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Gagal mengupload file: " + (e as Error).message },
      { status: 500 }
    );
  }
}
