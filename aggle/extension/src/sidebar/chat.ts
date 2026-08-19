import type { ChatMessage, PageContext, SidebarMode } from "../types";

// Conversation engine: builds prompts with optional page context, keeps the
// message history, and persists conversations to storage.

const SYSTEM_BASE =
  "You are Aggle, a concise assistant built into the user's browser. Answer in clean Markdown. Be brief unless asked for depth.";

const PAGE_TEMPLATE = (page: PageContext) =>
  `The user is currently viewing this page:\nTitle: ${page.title}\nURL: ${page.url}\n\nContent (may be truncated):\n"""\n${page.text}\n"""`;

export function buildMessages(
  history: ChatMessage[],
  userText: string,
  mode: SidebarMode,
  page: PageContext | null
): { role: "system" | "user" | "assistant"; content: string }[] {
  const out: { role: "system" | "user" | "assistant"; content: string }[] = [];
  let system = SYSTEM_BASE;

  if (page) {
    system += `\n\n${PAGE_TEMPLATE(page)}`;
  }

  out.push({ role: "system", content: system });

  const trimmedHistory = history.slice(-12); // keep the last 6 exchanges
  for (const m of trimmedHistory) {
    if (m.role === "system") continue;
    out.push({ role: m.role, content: m.content });
  }

  let prompt = userText;
  if (mode === "summarize") {
    prompt = `Summarize the page I'm viewing. Structure it as: a one-paragraph TL;DR, then key points as a bullet list, then any notable caveats.`;
  } else if (mode === "translate") {
    prompt = `Translate the main content of the page I'm viewing into ${userText || "English"}. Preserve the structure. Reply only with the translation.`;
  }
  out.push({ role: "user", content: prompt });
  return out;
}

export function newConversation(): { id: string; title: string; createdAt: number; messages: ChatMessage[] } {
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "New chat",
    createdAt: Date.now(),
    messages: [],
  };
}

export function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean || "New chat";
}
