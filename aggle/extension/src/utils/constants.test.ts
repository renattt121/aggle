import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS, BACKGROUND_PRESETS, BRAND, PROFILE_PRESETS } from "./constants";

describe("DEFAULT_SETTINGS", () => {
  it("has all required top-level keys", () => {
    expect(DEFAULT_SETTINGS).toHaveProperty("theme");
    expect(DEFAULT_SETTINGS).toHaveProperty("sidebar");
    expect(DEFAULT_SETTINGS).toHaveProperty("blocker");
    expect(DEFAULT_SETTINGS).toHaveProperty("performance");
    expect(DEFAULT_SETTINGS).toHaveProperty("general");
  });

  it("has correct theme defaults", () => {
    expect(DEFAULT_SETTINGS.theme.mode).toBe("dark");
    expect(DEFAULT_SETTINGS.theme.accentHue).toBe(18); // ember orange
    expect(DEFAULT_SETTINGS.theme.accentSaturation).toBe(100);
  });

  it("has correct sidebar defaults", () => {
    expect(DEFAULT_SETTINGS.sidebar.providerId).toBe("ollama");
    expect(DEFAULT_SETTINGS.sidebar.model).toBe("llama3.1");
    expect(DEFAULT_SETTINGS.sidebar.includePageContext).toBe(true);
  });

  it("has correct blocker defaults", () => {
    expect(DEFAULT_SETTINGS.blocker.enabled).toBe(true);
    expect(DEFAULT_SETTINGS.blocker.whitelist).toEqual([]);
    expect(DEFAULT_SETTINGS.blocker.lists).toHaveLength(1);
    expect(DEFAULT_SETTINGS.blocker.lists[0].bundled).toBe(true);
  });

  it("has correct performance defaults", () => {
    expect(DEFAULT_SETTINGS.performance.profile).toBe("balanced");
    expect(DEFAULT_SETTINGS.performance.processCount).toBe(8);
    expect(DEFAULT_SETTINGS.performance.diskCacheMb).toBe(512);
    expect(DEFAULT_SETTINGS.performance.hwVideoDecode).toBe(true);
    expect(DEFAULT_SETTINGS.performance.webRender).toBe(true);
  });

  it("has correct general defaults", () => {
    expect(DEFAULT_SETTINGS.general.customNewTab).toBe(true);
    expect(DEFAULT_SETTINGS.general.commandPaletteEnabled).toBe(true);
    expect(DEFAULT_SETTINGS.general.searchEngine).toBe("duckduckgo");
  });
});

describe("BACKGROUND_PRESETS", () => {
  it("has three presets", () => {
    expect(BACKGROUND_PRESETS).toHaveLength(3);
  });

  it("has correct preset ids", () => {
    const ids = BACKGROUND_PRESETS.map((p) => p.id);
    expect(ids).toContain("ember");
    expect(ids).toContain("frost");
    expect(ids).toContain("void");
  });

  it("each preset has from and to colors", () => {
    for (const preset of BACKGROUND_PRESETS) {
      expect(preset.from).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(preset.to).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("BRAND", () => {
  it("has brand tokens", () => {
    expect(BRAND.black).toBe("#0A0A0A");
    expect(BRAND.oled).toBe("#000000");
    expect(BRAND.accentFrom).toBe("#FF5A1F");
    expect(BRAND.accentTo).toBe("#FF8A3D");
  });
});

describe("PROFILE_PRESETS", () => {
  it("has eco preset with reduced resources", () => {
    expect(PROFILE_PRESETS.eco.processCount).toBe(4);
    expect(PROFILE_PRESETS.eco.diskCacheMb).toBe(256);
    expect(PROFILE_PRESETS.eco.hwVideoDecode).toBe(false);
  });

  it("has balanced preset", () => {
    expect(PROFILE_PRESETS.balanced.processCount).toBe(8);
    expect(PROFILE_PRESETS.balanced.diskCacheMb).toBe(512);
  });

  it("has performance preset with high resources", () => {
    expect(PROFILE_PRESETS.performance.processCount).toBe(12);
    expect(PROFILE_PRESETS.performance.diskCacheMb).toBe(2048);
  });
});
