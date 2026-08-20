import { describe, it, expect } from "vitest";
import { buildMessages, newConversation, titleFrom } from "./chat";
import type { ChatMessage, PageContext, SidebarMode } from "../types";

describe("newConversation", () => {
  it("returns a conversation with empty messages", () => {
    const conv = newConversation();
    expect(conv.id).toMatch(/^conv-/);
    expect(conv.title).toBe("New chat");
    expect(conv.createdAt).toBeGreaterThan(0);
    expect(conv.messages).toEqual([]);
  });
});

describe("titleFrom", () => {
  it("returns the text as-is when short", () => {
    expect(titleFrom("Hello world")).toBe("Hello world");
  });

  it("truncates long titles with ellipsis", () => {
    const long = "A".repeat(100);
    const result = titleFrom(long);
    expect(result.length).toBeLessThan(100);
    expect(result.endsWith("…")).toBe(true);
  });

  it("trims whitespace", () => {
    expect(titleFrom("  spaced out  ")).toBe("spaced out");
  });

  it("returns 'New chat' for empty input", () => {
    expect(titleFrom("")).toBe("New chat");
    expect(titleFrom("   ")).toBe("New chat");
  });
});

describe("buildMessages", () => {
  const pageContext: PageContext = {
    url: "https://example.com/article",
    title: "Example Article",
    text: "This is the main content of the article.",
    excerpt: "This is the main content",
  };

  it("includes system message", () => {
    const msgs = buildMessages([], "Hello", "chat", null);
    expect(msgs).toHaveLength(2); // system + user
    expect(msgs[0].role).toBe("system");
    expect(msgs[0].content).toContain("Aggle");
  });

  it("includes page context when provided", () => {
    const msgs = buildMessages([], "Summarize", "summarize", pageContext);
    expect(msgs[0].content).toContain("Example Article");
    expect(msgs[0].content).toContain("https://example.com/article");
  });

  it("does not include page context when null", () => {
    const msgs = buildMessages([], "Hello", "chat", null);
    expect(msgs[0].content).not.toContain("The user is currently viewing");
  });

  it("includes conversation history", () => {
    const history: ChatMessage[] = [
      { role: "user", content: "First question", timestamp: 1 },
      { role: "assistant", content: "First answer", timestamp: 2 },
    ];
    const msgs = buildMessages(history, "Second question", "chat", null);
    const userMsgs = msgs.filter((m) => m.role === "user");
    expect(userMsgs).toHaveLength(2);
    expect(userMsgs[0].content).toBe("First question");
    expect(userMsgs[1].content).toBe("Second question");
  });

  it("limits history to last 12 messages", () => {
    const history: ChatMessage[] = Array.from({ length: 20 }, (_, i) => ({
      role: "user" as const,
      content: `Message ${i}`,
      timestamp: i,
    }));
    const msgs = buildMessages(history, "Latest", "chat", null);
    // Should keep system + last ~12 history + latest user
    const historyMsgs = msgs.filter((m) => m.role !== "system");
    expect(historyMsgs.length).toBeLessThanOrEqual(14); // system + 12 history + latest
  });

  it("transforms summarize mode prompt", () => {
    const msgs = buildMessages([], "", "summarize", pageContext);
    const userMsg = msgs.find((m) => m.role === "user");
    expect(userMsg!.content).toContain("Summarize");
    expect(userMsg!.content).toContain("TL;DR");
  });

  it("transforms translate mode prompt", () => {
    const msgs = buildMessages([], "French", "translate", pageContext);
    const userMsg = msgs.find((m) => m.role === "user");
    expect(userMsg!.content).toContain("Translate");
    expect(userMsg!.content).toContain("French");
  });
});
