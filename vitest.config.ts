import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Run tests dari pola berikut. Test files harus berakhiran .test.ts(x)
    // atau di folder __tests__/.
    include: [
      "src/**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", ".next", "dist", ".prisma"],
    // Default environment: node (untuk unit test lib/*).
    // Component test akan specify jsdom per-file.
    environment: "node",
    // Coverage
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.{ts,tsx}"],
      exclude: [
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/__tests__/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
