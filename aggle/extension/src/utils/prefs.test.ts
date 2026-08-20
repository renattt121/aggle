import { describe, it, expect } from "vitest";
import { profileToUserJs } from "./prefs";
import type { ResourceProfileSettings } from "../types";

describe("profileToUserJs", () => {
  const baseProfile: ResourceProfileSettings = {
    profile: "balanced",
    processCount: 8,
    diskCacheMb: 512,
    hwVideoDecode: true,
    webRender: true,
  };

  it("generates user_pref for process count", () => {
    const result = profileToUserJs(baseProfile);
    expect(result).toContain('user_pref("dom.ipc.processCount", 8);');
  });

  it("generates user_pref for cache capacity (bytes)", () => {
    const result = profileToUserJs(baseProfile);
    // 512 MB = 512 * 1024 = 524288 bytes
    expect(result).toContain('user_pref("browser.cache.disk.capacity", 524288);');
  });

  it("enables disk cache when MB > 0", () => {
    const result = profileToUserJs(baseProfile);
    expect(result).toContain('user_pref("browser.cache.disk.enable", true);');
  });

  it("disables disk cache when MB is 0", () => {
    const profile = { ...baseProfile, diskCacheMb: 0 };
    const result = profileToUserJs(profile);
    expect(result).toContain('user_pref("browser.cache.disk.enable", false);');
  });

  it("generates user_pref for hardware video decoding", () => {
    const result = profileToUserJs(baseProfile);
    expect(result).toContain('user_pref("media.hardware-video-decoding.enabled", true);');
  });

  it("generates user_pref for WebRender", () => {
    const result = profileToUserJs(baseProfile);
    expect(result).toContain('user_pref("gfx.webrender.all", true);');
  });

  it("includes header comment", () => {
    const result = profileToUserJs(baseProfile);
    expect(result).toContain("// Aggle resource profile");
  });

  it("respects hwVideoDecode false", () => {
    const profile = { ...baseProfile, hwVideoDecode: false };
    const result = profileToUserJs(profile);
    expect(result).toContain('user_pref("media.hardware-video-decoding.enabled", false);');
  });

  it("respects webRender false", () => {
    const profile = { ...baseProfile, webRender: false };
    const result = profileToUserJs(profile);
    expect(result).toContain('user_pref("gfx.webrender.all", false);');
  });
});
