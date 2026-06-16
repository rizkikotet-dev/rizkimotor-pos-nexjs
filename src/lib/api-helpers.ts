// API route helpers — reduce boilerplate di [id] routes.

import { NextResponse } from "next/server";
import type { ZodError } from "zod";

/** Parse ID from params. Returns number or null. */
export function parseId(idStr: string): number | null {
  const id = parseInt(idStr);
  return isNaN(id) ? null : id;
}

/** Standard 400 response for invalid ID. */
export function invalidId() {
  return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
}

/** Standard 400 response for Zod validation errors. */
export function zodError(e: ZodError) {
  return NextResponse.json({ error: e.flatten() }, { status: 400 });
}
