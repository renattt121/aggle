import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders bold text", () => {
    const result = renderMarkdown("**hello**");
    expect(result).toContain("<strong>hello</strong>");
  });

  it("renders italic text", () => {
    const result = renderMarkdown("*hello*");
    expect(result).toContain("<em>hello</em>");
  });

  it("renders inline code", () => {
    const result = renderMarkdown("Use `console.log` to debug.");
    expect(result).toContain("<code>console.log</code>");
  });

  it("renders links", () => {
    const result = renderMarkdown("[Aggle](https://aggle.dev)");
    expect(result).toContain('<a href="https://aggle.dev"');
    expect(result).toContain(">Aggle</a>");
  });

  it("renders code blocks", () => {
    const result = renderMarkdown("```\nconst x = 1;\n```");
    expect(result).toContain("<pre><code>const x = 1;</code></pre>");
  });

  it("renders headings", () => {
    const result = renderMarkdown("# Heading 1\n## Heading 2\n### Heading 3");
    expect(result).toContain("<h2>Heading 1</h2>");
    expect(result).toContain("<h3>Heading 2</h3>");
    expect(result).toContain("<h4>Heading 3</h4>");
  });

  it("renders unordered lists", () => {
    const result = renderMarkdown("- Item 1\n- Item 2\n- Item 3");
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>Item 1</li>");
    expect(result).toContain("<li>Item 2</li>");
    expect(result).toContain("<li>Item 3</li>");
    expect(result).toContain("</ul>");
  });

  it("renders ordered lists", () => {
    const result = renderMarkdown("1. First\n2. Second");
    expect(result).toContain("<ol>");
    expect(result).toContain("<li>First</li>");
    expect(result).toContain("<li>Second</li>");
    expect(result).toContain("</ol>");
  });

  it("renders blockquotes", () => {
    const result = renderMarkdown("> This is a quote");
    expect(result).toContain("<blockquote>This is a quote</blockquote>");
  });

  it("escapes HTML to prevent injection", () => {
    const result = renderMarkdown("<script>alert('xss')</script>");
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("handles empty input", () => {
    const result = renderMarkdown("");
    expect(result).toBe("");
  });

  it("converts plain text to paragraphs", () => {
    const result = renderMarkdown("Hello world");
    expect(result).toContain("<p>Hello world</p>");
  });

  it("handles mixed content", () => {
    const result = renderMarkdown(
      "# Title\n\nSome **bold** and `code` text.\n\n- list item\n\n> a quote"
    );
    expect(result).toContain("<h2>Title</h2>");
    expect(result).toContain("<strong>bold</strong>");
    expect(result).toContain("<code>code</code>");
    expect(result).toContain("<ul>");
    expect(result).toContain("<blockquote>");
  });
});
