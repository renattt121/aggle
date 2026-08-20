import { defineConfig } from "@vitest/browser/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@aggle/src": resolve(__dirname, "extension/src"),
    },
  },
  browser: {
    providers: {
      firefox: {
        browser: "firefox",
        enabled: true,
        instances: [{ browser: "firefox" }],
      },
    },
    screenshotFailures: false,
  },
  test: {
    globals: true,
    browser: true,
    testTimeout: 15000,
    include: ["extension/src/**/*.e2e.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
