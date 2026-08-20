import { describe, it, expect } from "vitest";

// The newtab module has browser API dependencies. We test the URL-detection
// logic by extracting it into a testable form.
describe("newtab URL detection", () => {
  function isProbablyUrl(input: string): boolean {
    if (!input) return false;
    if (/^https?:\/\//i.test(input)) return true;
    if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}/.test(input)) return true;
    if (/^localhost(?::\d+)?\/?$/.test(input)) return true;
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?$/.test(input)) return true;
    return false;
  }

  it("recognizes full URLs", () => {
    expect(isProbablyUrl("https://example.com")).toBe(true);
    expect(isProbablyUrl("http://example.com/path")).toBe(true);
    expect(isProbablyUrl("https://github.com/user/repo")).toBe(true);
  });

  it("recognizes domain names", () => {
    expect(isProbablyUrl("example.com")).toBe(true);
    expect(isProbablyUrl("www.google.com")).toBe(true);
    expect(isProbablyUrl("sub.domain.co.uk")).toBe(true);
    expect(isProbablyUrl("my-app.dev")).toBe(true);
  });

  it("recognizes localhost", () => {
    expect(isProbablyUrl("localhost")).toBe(true);
    expect(isProbablyUrl("localhost:3000")).toBe(true);
    expect(isProbablyUrl("localhost:8080/")).toBe(true);
  });

  it("recognizes IP addresses", () => {
    expect(isProbablyUrl("127.0.0.1")).toBe(true);
    expect(isProbablyUrl("192.168.1.1")).toBe(true);
    expect(isProbablyUrl("10.0.0.1:8080")).toBe(true);
  });

  it("does not treat search queries as URLs", () => {
    expect(isProbablyUrl("hello world")).toBe(false);
    expect(isProbablyUrl("javascript tutorial")).toBe(false);
    expect(isProbablyUrl("what is react")).toBe(false);
    expect(isProbablyUrl("recipe for pancakes")).toBe(false);
  });

  it("does not treat single words as URLs", () => {
    expect(isProbablyUrl("google")).toBe(false);
    expect(isProbablyUrl("react")).toBe(false);
    expect(isProbablyUrl("typescript")).toBe(false);
  });

  it("returns false for empty input", () => {
    expect(isProbablyUrl("")).toBe(false);
    expect(isProbablyUrl("   ")).toBe(false);
  });
});

describe("search engine URLs", () => {
  const engines = {
    duckduckgo: { icon: "🦆", search: (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
    google: { icon: "G", search: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
    bing: { icon: "B", search: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  };

  it("generates correct DuckDuckGo URL", () => {
    expect(engines.duckduckgo.search("aggle browser")).toBe(
      "https://duckduckgo.com/?q=aggle%20browser"
    );
  });

  it("generates correct Google URL", () => {
    expect(engines.google.search("aggle browser")).toBe(
      "https://www.google.com/search?q=aggle%20browser"
    );
  });

  it("generates correct Bing URL", () => {
    expect(engines.bing.search("aggle browser")).toBe(
      "https://www.bing.com/search?q=aggle%20browser"
    );
  });

  it("encodes special characters in query", () => {
    const query = "JavaScript & TypeScript";
    expect(engines.duckduckgo.search(query)).toContain("JavaScript%20%26%20TypeScript");
  });
});
