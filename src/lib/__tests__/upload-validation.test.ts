import { describe, it, expect } from "vitest";
import { verifyMagicBytes, detectMimeType } from "@/lib/upload-validation";

function hex(s: string): Uint8Array {
  return new Uint8Array(s.match(/.{1,2}/g)!.map((h) => parseInt(h, 16)));
}

const PNG = hex("89504E470D0A1A0A0000000D49484452");
const JPEG = hex("FFD8FFE000104A464946");
const WEBP = hex("524946462A00000057454250");
const GIF = hex("47494638396101000100");
const SCRIPT = hex("3C3F706870206563686F20303B"); // <?php echo 0;
const RANDOM = hex("000000000000000000000000");

describe("verifyMagicBytes", () => {
  it("accepts valid PNG signature", () => {
    expect(verifyMagicBytes(PNG, "image/png")).toBe(true);
  });

  it("accepts valid JPEG signature", () => {
    expect(verifyMagicBytes(JPEG, "image/jpeg")).toBe(true);
  });

  it("accepts valid WebP signature (RIFF....WEBP)", () => {
    expect(verifyMagicBytes(WEBP, "image/webp")).toBe(true);
  });

  it("accepts valid GIF signature (GIF8)", () => {
    expect(verifyMagicBytes(GIF, "image/gif")).toBe(true);
  });

  it("rejects script bytes claimed as image/png (MIME spoofing)", () => {
    expect(verifyMagicBytes(SCRIPT, "image/png")).toBe(false);
  });

  it("rejects random bytes claimed as image/png", () => {
    expect(verifyMagicBytes(RANDOM, "image/png")).toBe(false);
  });

  it("rejects JPEG content claimed as image/png (wrong claim)", () => {
    expect(verifyMagicBytes(JPEG, "image/png")).toBe(false);
  });

  it("rejects unknown MIME types", () => {
    expect(verifyMagicBytes(PNG, "image/svg+xml")).toBe(false);
  });

  it("rejects empty buffer", () => {
    expect(verifyMagicBytes(new Uint8Array(0), "image/png")).toBe(false);
  });

  it("rejects truncated PNG (less than 8 bytes)", () => {
    const truncated = PNG.slice(0, 4);
    expect(verifyMagicBytes(truncated, "image/png")).toBe(false);
  });
});

describe("detectMimeType", () => {
  it("detects PNG", () => {
    expect(detectMimeType(PNG)).toBe("image/png");
  });
  it("detects JPEG", () => {
    expect(detectMimeType(JPEG)).toBe("image/jpeg");
  });
  it("detects WebP", () => {
    expect(detectMimeType(WEBP)).toBe("image/webp");
  });
  it("detects GIF", () => {
    expect(detectMimeType(GIF)).toBe("image/gif");
  });
  it("returns null for script bytes", () => {
    expect(detectMimeType(SCRIPT)).toBeNull();
  });
  it("returns null for empty buffer", () => {
    expect(detectMimeType(new Uint8Array(0))).toBeNull();
  });
});
