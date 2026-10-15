import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests for pure business rules (grading, finance, permissions, payroll,
// rate limiting, certificate signing). No database or Next runtime needed.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      // `server-only` throws outside a React Server Component bundle.
      "server-only": path.resolve(__dirname, "tests/unit/stubs/empty.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
