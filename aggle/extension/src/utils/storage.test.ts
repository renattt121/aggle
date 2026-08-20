import { describe, it, expect, vi, beforeEach } from "vitest";

// The storage module depends on browser.storage — we mock it in test/setup.ts
// but we need to test the merge logic and default handling.
describe("storage utilities", () => {
  describe("merge function (internal logic)", () => {
    // We can't directly import the private `merge` function, but we can test
    // getSettings through the public API which uses it internally.
    it("getSettings returns defaults when no storage data exists", async () => {
      const { getSettings } = await import("./storage");
      const settings = await getSettings();
      expect(settings.theme.mode).toBe("dark");
      expect(settings.general.searchEngine).toBe("duckduckgo");
      expect(settings.blocker.enabled).toBe(true);
    });

    it("getSettings merges stored data over defaults", async () => {
      const { getSettings, setItem } = await import("./storage");
      await setItem("aggle-settings", {
        theme: { mode: "oled", accentHue: 200 },
      });
      const settings = await getSettings();
      expect(settings.theme.mode).toBe("oled");
      expect(settings.theme.accentHue).toBe(200);
      // Other defaults should still be present
      expect(settings.sidebar.providerId).toBe("ollama");
      expect(settings.performance.profile).toBe("balanced");
    });

    it("getItem returns fallback for missing keys", async () => {
      const { getItem } = await import("./storage");
      const result = await getItem("nonexistent-key", { fallback: true });
      expect(result).toEqual({ fallback: true });
    });

    it("setItem stores and retrieves data", async () => {
      const { setItem, getItem } = await import("./storage");
      await setItem("test-key", { value: 42 });
      const result = await getItem("test-key", null as unknown as { value: number });
      expect(result).toEqual({ value: 42 });
    });
  });
});
