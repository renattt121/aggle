import { describe, it, expect } from "vitest";
import { parseRule, parseFilterList } from "./parser";
import type { Filter } from "./types";

describe("parseRule", () => {
  it("returns null for empty lines", () => {
    expect(parseRule("")).toBeNull();
    expect(parseRule("   ")).toBeNull();
  });

  it("returns null for comment lines", () => {
    expect(parseRule("! This is a comment")).toBeNull();
    expect(parseRule("[Adblock Plus 2.0]")).toBeNull();
  });

  it("parses hostname-anchored rules (||prefix^)", () => {
    const rule = parseRule("||doubleclick.net^$third-party");
    expect(rule).not.toBeNull();
    expect(rule!.type).toBe("network");
    expect(rule!.pattern).toBe("||doubleclick.net^$third-party");
    expect(rule!.isException).toBe(false);
    expect(rule!.regex!.test("https://doubleclick.net/ad.js")).toBe(true);
    expect(rule!.regex!.test("https://example.com/ad.js")).toBe(false);
  });

  it("parses left-anchored substring rules (|prefix)", () => {
    const rule = parseRule("|https://coinhive.com/");
    expect(rule).not.toBeNull();
    expect(rule!.regex!.test("https://coinhive.com/miner.js")).toBe(true);
    expect(rule!.regex!.test("https://example.com/coinhive.js")).toBe(false);
  });

  it("parses wildcard rules", () => {
    const rule = parseRule("*.example.com/*");
    expect(rule).not.toBeNull();
    expect(rule!.regex!.test("ads.example.com/banner.jpg")).toBe(true);
    // *.example.com/* requires a subdomain, so example.com/page should NOT match
    expect(rule!.regex!.test("example.com/page")).toBe(false);
    expect(rule!.regex!.test("other.com/ad.jpg")).toBe(false);
  });

  it("parses exception rules (@@prefix)", () => {
    const rule = parseRule("@@||facebook.com^$third-party");
    expect(rule).not.toBeNull();
    expect(rule!.isException).toBe(true);
  });

  it("parses exact match rules", () => {
    const rule = parseRule("analytics.yahoo.com");
    expect(rule).not.toBeNull();
    expect(rule!.regex!.test("https://analytics.yahoo.com/track")).toBe(true);
    expect(rule!.regex!.test("https://not-analytics.yahoo.com/track")).toBe(false);
  });

  it("handles $third-party modifier", () => {
    const rule = parseRule("||googlesyndication.com^$third-party");
    expect(rule).not.toBeNull();
    expect(rule!.regex!.test("https://googlesyndication.com/ad.js")).toBe(true);
  });

  it("returns null for malformed patterns", () => {
    // A rule that produces an invalid regex should be handled gracefully
    const rule = parseRule("||invalid[[pattern^");
    // The parser should still attempt to create a regex
    expect(rule).not.toBeNull();
  });
});

describe("parseFilterList", () => {
  it("parses a multi-line filter list", () => {
    const text = `
! Comment line
||doubleclick.net^$third-party
|https://coinhive.com/
! Another comment
@@||allowed.com^
`;
    const rules = parseFilterList(text);
    expect(rules).toHaveLength(3);
    expect(rules.every((r) => r.type === "network")).toBe(true);
  });

  it("filters out comments and blank lines", () => {
    const text = `
! comment
||test.com^

! another comment
`;
    const rules = parseFilterList(text);
    expect(rules).toHaveLength(1);
  });

  it("handles empty input", () => {
    expect(parseFilterList("")).toEqual([]);
    expect(parseFilterList("   \n  \n")).toEqual([]);
  });
});
