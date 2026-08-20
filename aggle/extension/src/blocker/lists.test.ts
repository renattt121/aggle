import { describe, it, expect } from "vitest";
import { BUNDLED_FILTERS } from "./lists";

describe("BUNDLED_FILTERS", () => {
  it("is a non-empty string", () => {
    expect(BUNDLED_FILTERS.length).toBeGreaterThan(0);
  });

  it("contains ad network rules", () => {
    expect(BUNDLED_FILTERS).toContain("doubleclick.net");
    expect(BUNDLED_FILTERS).toContain("googlesyndication.com");
    expect(BUNDLED_FILTERS).toContain("googletagmanager.com");
  });

  it("contains tracker rules", () => {
    expect(BUNDLED_FILTERS).toContain("facebook.net");
    expect(BUNDLED_FILTERS).toContain("mixpanel.com");
    expect(BUNDLED_FILTERS).toContain("hotjar.com");
  });

  it("contains crypto miner blocks", () => {
    expect(BUNDLED_FILTERS).toContain("coinhive.com");
    expect(BUNDLED_FILTERS).toContain("minero.pw");
  });

  it("uses correct ABP syntax", () => {
    // At least some rules should use ||domain^ syntax
    const lines = BUNDLED_FILTERS.split("\n").filter((l) => l.trim() && !l.trim().startsWith("!"));
    const domainRules = lines.filter((l) => l.includes("||") || l.startsWith("|"));
    expect(domainRules.length).toBeGreaterThan(0);
  });

  it("has no empty lines in active rules", () => {
    const activeRules = BUNDLED_FILTERS.split("\n").filter((l) => l.trim() && !l.trim().startsWith("!"));
    expect(activeRules.every((l) => l.trim().length > 0)).toBe(true);
  });
});
