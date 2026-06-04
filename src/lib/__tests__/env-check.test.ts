import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env-check";

// process.env typed sebagai readonly literal — cast ke mutable untuk test.
const env = process.env as unknown as Record<string, string | undefined>;

describe("validateEnv", () => {
  // Save & restore env around each test karena validateEnv() baca process.env langsung.
  const originalSecret = process.env.NEXTAUTH_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset ke state kosong; setiap test akan set sendiri.
    delete env.NEXTAUTH_SECRET;
    delete env.NODE_ENV;
  });

  afterEach(() => {
    if (originalSecret === undefined) delete env.NEXTAUTH_SECRET;
    else env.NEXTAUTH_SECRET = originalSecret;
    if (originalNodeEnv === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = originalNodeEnv;
  });

  it("rejects empty secret", () => {
    env.NEXTAUTH_SECRET = "";
    expect(() => validateEnv()).toThrow();
  });

  it("rejects short secret (< 32 chars)", () => {
    env.NEXTAUTH_SECRET = "short";
    expect(() => validateEnv()).toThrow();
  });

  it("accepts 32+ char secret in development", () => {
    env.NEXTAUTH_SECRET = "a".repeat(32);
    expect(() => validateEnv()).not.toThrow();
  });

  it("rejects known weak secret in production (default rizki-motor)", () => {
    env.NEXTAUTH_SECRET = "rizki-motor-dev-secret-1234567890";
    env.NODE_ENV = "production";
    expect(() => validateEnv()).toThrow();
  });

  it("accepts strong secret in production", () => {
    env.NEXTAUTH_SECRET = "XyZ9kLm3pQr8vW7nB5jF2hG4dS6aC1eU0iO9yT8rE4wQ=";
    env.NODE_ENV = "production";
    expect(() => validateEnv()).not.toThrow();
  });

  it("rejects 'change-this-in-production' in production", () => {
    env.NEXTAUTH_SECRET = "change-this-in-production-1234567890";
    env.NODE_ENV = "production";
    expect(() => validateEnv()).toThrow();
  });

  it("rejects 'your-secret' placeholder in production", () => {
    env.NEXTAUTH_SECRET = "your-secret-1234567890abcdefghij";
    env.NODE_ENV = "production";
    expect(() => validateEnv()).toThrow();
  });

  it("accepts 'change-this' in development", () => {
    env.NEXTAUTH_SECRET = "change-this-in-production-1234567890";
    // NODE_ENV default = development
    expect(() => validateEnv()).not.toThrow();
  });
});
