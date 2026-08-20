import { defineConfig } from "vitest/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@aggle/src": resolve(__dirname, "extension/src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["extension/src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.e2e.ts"],
    setupFiles: ["./test/setup.ts"],
    root: __dirname,
  },
});
