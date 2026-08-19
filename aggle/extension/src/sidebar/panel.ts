import { getSettings, onSettingsChanged, getItem, setItem } from "../utils/storage";
import type { AggleSettings, Conversation, PageContext, SidebarMode } from "../types";
import { getAllProviders, getProvider, apiKeyFor } from "./providers/registry";
import { streamChat, listModels } from "./client";
import { buildMessages, newConversation, titleFrom } from "./chat";
import { renderMarkdown } from "./markdown";
import type { ProviderDefinition } from "./providers/types";

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

let settings: AggleSettings;
let providers: ProviderDefinition[] = [];
let conversation: Conversation = newConversation();
let mode: SidebarMode = "chat";
let pageContext: PageContext | null = null;
let contextDismissed = false;
let streaming = false;

// ---------------------------------------------------------------------------
// Message DOM
// ---------------------------------------------------------------------------

function addMessageEl(cls: "user" | "assistant" | "error", content: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `msg ${cls}`;
  if (cls === "assistant") el.innerHTML = renderMarkdown(content);
  else el.textContent = content;
  $("#empty-state")?.remove();
  $("#messages").appendChild(el);
  $("#messages").scrollTop = $("#messages").scrollHeight;
  return el;
}

// ---------------------------------------------------------------------------
// Page context
// ---------------------------------------------------------------------------

async function loadPageContext(): Promise<void> {
  if (!settings.sidebar.includePageContext || contextDismissed) return;
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id || !tab.url?.startsWith("http")) return;
  try {
    await browser.tabs.executeScript(tab.id, { file: "/dist/content.js" });
    const ctx = (await browser.tabs.sendMessage(tab.id, { action: "content:extractPage" })) as PageContext | undefined;
    if (ctx?.text) {
      pageContext = ctx;
      $("#ctx-pill").hidden = false;
      $("#ctx-title").textContent = ctx.title || ctx.url;
    }
  } catch { /* privileged URL — chat without context */ }
}

// ---------------------------------------------------------------------------
// Provider / model pickers
// ---------------------------------------------------------------------------

async function refreshProviders(): Promise<void> {
  providers = await getAllProviders();
  const sel = $<HTMLSelectElement>("#provider-select");
  sel.innerHTML = "";
  for (const p of providers) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  }
  sel.value = settings.sidebar.providerId;
  if (sel.selectedIndex === -1 && providers.length) sel.value = providers[0].id;
  await refreshModels();
}

async function refreshModels(): Promise<void> {
  const provider = providers.find((p) => p.id === $<HTMLSelectElement>("#provider-select").value);
  if (!provider) return;
  const sel = $<HTMLSelectElement>("#model-select");
  sel.innerHTML = "";
  const models = await listModels(provider, apiKeyFor(provider, settings.sidebar));
  for (const m of models.slice(0, 60)) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  }
  sel.value = settings.sidebar.model;
  if (sel.selectedIndex === -1 && models.length) {
    sel.value = models[0];
    settings.sidebar.model = models[0];
  }
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

async function send(): Promise<void> {
  if (streaming) return;
  const input = $<HTMLTextAreaElement>("#input");
  const userText = input.value.trim();

  if (mode === "chat" && !userText) return;
  if (mode === "summarize" && !pageContext) {
    addMessageEl("error", "No readable page in this window — open an article first, then hit Summarize.");
    return;
  }

  const provider = await getProvider($<HTMLSelectElement>("#provider-select").value);
  if (!provider) return;
  if (provider.needsApiKey && !apiKeyFor(provider, settings.sidebar)) {
    addMessageEl("error", `No API key set for ${provider.name}. Open Settings → AI Sidebar to add one.`);
    return;
  }

  const model = $<HTMLSelectElement>("#model-select").value || settings.sidebar.model;

  if (mode === "chat") {
    addMessageEl("user", userText);
    conversation.messages.push({ role: "user", content: userText, timestamp: Date.now() });
  }
  input.value = "";
  autoGrow();

  const assistantEl = addMessageEl("assistant", "");
  assistantEl.innerHTML = `<span class="cursor"></span>`;
  let acc = "";
  streaming = true;
  $<HTMLButtonElement>("#send").disabled = true;
  $("#status").textContent = provider.id === "ollama" ? "Asking your local model…" : "Thinking…";

  await streamChat(
    provider,
    apiKeyFor(provider, settings.sidebar),
    model,
    buildMessages(conversation.messages, userText, mode, pageContext),
    {
      onToken: (token) => {
        acc += token;
        assistantEl.innerHTML = renderMarkdown(acc) + `<span class="cursor"></span>`;
        const box = $("#messages");
        if (box.scrollHeight - box.scrollTop - box.clientHeight < 160) box.scrollTop = box.scrollHeight;
      },
      onDone: () => {
        assistantEl.innerHTML = renderMarkdown(acc);
        finishTurn(acc);
      },
      onError: (message) => {
        if (acc) assistantEl.innerHTML = renderMarkdown(acc);
        else assistantEl.remove();
        addMessageEl("error", message);
        finishTurn(acc);
      },
    }
  );
}

function finishTurn(assistantText: string): void {
  if (assistantText) {
    conversation.messages.push({ role: "assistant", content: assistantText, timestamp: Date.now() });
    if (conversation.messages.filter((m) => m.role === "user").length === 1) {
      conversation.title = titleFrom(conversation.messages[0].content);
    }
  }
  streaming = false;
  $<HTMLButtonElement>("#send").disabled = false;
  $("#status").textContent = "";
  void persistConversation();
}

async function persistConversation(): Promise<void> {
  const all = await getItem<Conversation[]>("aggle-conversations", []);
  const idx = all.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) all[idx] = conversation;
  else all.unshift(conversation);
  await setItem("aggle-conversations", all.slice(0, 30));
}

// ---------------------------------------------------------------------------
// UI wiring
// ---------------------------------------------------------------------------

function autoGrow(): void {
  const input = $<HTMLTextAreaElement>("#input");
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
}

function setMode(next: SidebarMode): void {
  mode = next;
  document.querySelectorAll(".mode").forEach((b) => b.classList.toggle("active", (b as HTMLElement).dataset.mode === mode));
  const input = $<HTMLTextAreaElement>("#input");
  if (mode === "summarize") {
    input.placeholder = "Click ➤ to summarize the page you're viewing…";
  } else if (mode === "translate") {
    input.placeholder = "Translate the page into… (English, Українська, Deutsch…)";
  } else {
    input.placeholder = "Ask about this page, or anything…";
  }
}

function bindChips(root: ParentNode): void {
  root.querySelectorAll(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      $<HTMLTextAreaElement>("#input").value = (c as HTMLElement).dataset.fill ?? "";
      autoGrow();
      $<HTMLTextAreaElement>("#input").focus();
    })
  );
}

function bindUI(): void {
  $<HTMLSelectElement>("#provider-select").addEventListener("change", async (e) => {
    settings.sidebar.providerId = (e.target as HTMLSelectElement).value;
    await refreshModels();
  });
  $<HTMLSelectElement>("#model-select").addEventListener("change", (e) => {
    settings.sidebar.model = (e.target as HTMLSelectElement).value;
  });

  document.querySelectorAll(".mode").forEach((b) =>
    b.addEventListener("click", () => setMode((b as HTMLElement).dataset.mode as SidebarMode))
  );
  bindChips(document);

  const input = $<HTMLTextAreaElement>("#input");
  input.addEventListener("input", autoGrow);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  });
  $("#send").addEventListener("click", () => void send());

  $("#new-chat").addEventListener("click", () => {
    conversation = newConversation();
    contextDismissed = false;
    pageContext = null;
    $("#ctx-pill").hidden = true;
    const box = $("#messages");
    box.innerHTML = "";
    box.appendChild(buildEmptyState());
    setMode("chat");
  });

  $("#ctx-remove").addEventListener("click", () => {
    contextDismissed = true;
    pageContext = null;
    $("#ctx-pill").hidden = true;
  });

  onSettingsChanged((next) => {
    settings = next;
  });
}

function buildEmptyState(): HTMLElement {
  const el = document.createElement("div");
  el.className = "empty";
  el.id = "empty-state";
  el.innerHTML = `
    <div class="empty-mark">▲</div>
    <h2>Ask anything</h2>
    <p>Aggle can see the page you're viewing. Try:</p>
    <div class="chips">
      <button class="chip" data-fill="Explain the key ideas of this page simply.">Explain this page</button>
      <button class="chip" data-fill="Summarize this page in 3 bullets.">3-bullet summary</button>
      <button class="chip" data-fill="What are the main arguments against this article's thesis?">Challenge it</button>
      <button class="chip" data-fill="Extract all facts and figures into a table.">Extract facts</button>
    </div>`;
  bindChips(el);
  return el;
}

(async () => {
  settings = await getSettings();
  bindUI();
  setMode("chat");
  await refreshProviders();
  await loadPageContext();

  // Re-check context when the user switches tabs while the sidebar is open.
  browser.tabs.onActivated.addListener(() => {
    contextDismissed = false;
    pageContext = null;
    $("#ctx-pill").hidden = true;
    void loadPageContext();
  });
})();
