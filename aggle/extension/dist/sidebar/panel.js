"use strict";
(() => {
  // extension/src/utils/constants.ts
  var DEFAULT_SETTINGS = {
    theme: {
      mode: "dark",
      accentHue: 18,
      // ember orange
      accentSaturation: 100,
      blurIntensity: 24,
      grainOpacity: 15,
      backgroundPreset: "ember"
    },
    sidebar: {
      providerId: "ollama",
      model: "llama3.1",
      apiKeyGroq: "",
      apiKeyOpenai: "",
      apiKeyXai: "",
      ollamaUrl: "http://localhost:11434",
      includePageContext: true
    },
    blocker: {
      enabled: true,
      lists: [
        {
          id: "aggle-builtin",
          name: "Aggle Base List",
          url: "bundled:base",
          enabled: true,
          bundled: true,
          ruleCount: 0,
          lastUpdated: 0
        }
      ],
      whitelist: [],
      stats: {
        totalBlocked: 0,
        blockedToday: 0,
        lastResetDate: "",
        perSite: {}
      }
    },
    performance: {
      profile: "balanced",
      processCount: 8,
      diskCacheMb: 512,
      hwVideoDecode: true,
      webRender: true
    },
    general: {
      customNewTab: true,
      commandPaletteEnabled: true
    }
  };
  var STORAGE_KEY = "aggle-settings";

  // extension/src/utils/storage.ts
  function merge(base, patch) {
    if (patch === null || patch === void 0) return base;
    if (typeof base !== "object" || Array.isArray(base) || typeof patch !== "object" || Array.isArray(patch)) {
      return patch;
    }
    const out = { ...base };
    for (const [k, v] of Object.entries(patch)) {
      out[k] = k in base ? merge(base[k], v) : v;
    }
    return out;
  }
  async function getSettings() {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    return merge(DEFAULT_SETTINGS, stored[STORAGE_KEY]);
  }
  async function getItem(key, fallback) {
    const stored = await browser.storage.local.get(key);
    return stored[key] ?? fallback;
  }
  async function setItem(key, value) {
    await browser.storage.local.set({ [key]: value });
  }
  function onSettingsChanged(callback) {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        callback(changes[STORAGE_KEY].newValue);
      }
    });
  }

  // extension/src/sidebar/providers/registry.ts
  var BUILTIN_PROVIDERS = [
    {
      id: "ollama",
      name: "Ollama (local)",
      baseUrl: "http://localhost:11434",
      chatPath: "/v1/chat/completions",
      modelsPath: "/v1/models",
      authScheme: "none",
      needsApiKey: false,
      models: ["llama3.1", "llama3.2", "qwen2.5", "mistral", "gemma2"],
      extraBody: { stream: true }
    },
    {
      id: "groq",
      name: "Groq",
      baseUrl: "https://api.groq.com/openai",
      chatPath: "/v1/chat/completions",
      modelsPath: "/v1/models",
      authScheme: "bearer",
      needsApiKey: true,
      models: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"]
    },
    {
      id: "openai",
      name: "OpenAI",
      baseUrl: "https://api.openai.com",
      chatPath: "/v1/chat/completions",
      modelsPath: "/v1/models",
      authScheme: "bearer",
      needsApiKey: true,
      models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "o4-mini"]
    },
    {
      id: "xai",
      name: "xAI",
      baseUrl: "https://api.x.ai",
      chatPath: "/v1/chat/completions",
      modelsPath: "/v1/models",
      authScheme: "bearer",
      needsApiKey: true,
      models: ["grok-3", "grok-3-mini", "grok-2-1212"]
    }
  ];
  async function getAllProviders() {
    const custom = await getItem("aggle-providers", []);
    const valid = custom.filter(
      (p) => p && typeof p.id === "string" && typeof p.baseUrl === "string" && !BUILTIN_PROVIDERS.some((b) => b.id === p.id)
    );
    return [...BUILTIN_PROVIDERS, ...valid];
  }
  async function getProvider(id) {
    const all = await getAllProviders();
    return all.find((p) => p.id === id);
  }
  function apiKeyFor(provider, settings2) {
    switch (provider.id) {
      case "groq":
        return settings2.apiKeyGroq;
      case "openai":
        return settings2.apiKeyOpenai;
      case "xai":
        return settings2.apiKeyXai;
      default:
        return "";
    }
  }

  // extension/src/sidebar/client.ts
  function buildRequest(provider, apiKey, messages) {
    const headers = {
      "Content-Type": "application/json",
      ...provider.extraHeaders ?? {}
    };
    if (provider.authScheme === "bearer" && apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }
    const body = { model: "", messages, stream: true, ...provider.extraBody ?? {} };
    return {
      url: `${provider.baseUrl.replace(/\/$/, "")}${provider.chatPath}`,
      init: { method: "POST", headers, body: JSON.stringify(body) }
    };
  }
  async function streamChat(provider, apiKey, model, messages, handlers) {
    const { url, init } = buildRequest(provider, apiKey, messages);
    const body = JSON.parse(init.body);
    body.model = model;
    init.body = JSON.stringify(body);
    let response;
    try {
      response = await fetch(url, init);
    } catch (e) {
      handlers.onError(
        provider.id === "ollama" ? `Can't reach Ollama at ${provider.baseUrl}. Is it running? (ollama serve)` : `Network error reaching ${provider.name}: ${e.message}`
      );
      return;
    }
    if (!response.ok || !response.body) {
      let detail = `${response.status} ${response.statusText}`;
      try {
        const j = await response.json();
        detail = j?.error?.message ?? detail;
      } catch {
      }
      handlers.onError(`${provider.name}: ${detail}`);
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let anyToken = false;
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const token = json?.choices?.[0]?.delta?.content ?? "";
            if (token) {
              anyToken = true;
              handlers.onToken(token);
            }
          } catch {
          }
        }
      }
      if (!anyToken) handlers.onError("The model returned an empty response.");
      else handlers.onDone();
    } catch (e) {
      if (anyToken) handlers.onDone();
      else handlers.onError(`Stream failed: ${e.message}`);
    }
  }
  async function listModels(provider, apiKey) {
    if (!provider.modelsPath) return provider.models;
    const headers = {};
    if (provider.authScheme === "bearer" && apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    try {
      const res = await fetch(`${provider.baseUrl.replace(/\/$/, "")}${provider.modelsPath}`, { headers });
      if (!res.ok) return provider.models;
      const json = await res.json();
      const remote = (json?.data ?? []).map((m) => m.id).filter(Boolean);
      return remote.length ? remote : provider.models;
    } catch {
      return provider.models;
    }
  }

  // extension/src/sidebar/chat.ts
  var SYSTEM_BASE = "You are Aggle, a concise assistant built into the user's browser. Answer in clean Markdown. Be brief unless asked for depth.";
  var PAGE_TEMPLATE = (page) => `The user is currently viewing this page:
Title: ${page.title}
URL: ${page.url}

Content (may be truncated):
"""
${page.text}
"""`;
  function buildMessages(history, userText, mode2, page) {
    const out = [];
    let system = SYSTEM_BASE;
    if (page) {
      system += `

${PAGE_TEMPLATE(page)}`;
    }
    out.push({ role: "system", content: system });
    const trimmedHistory = history.slice(-12);
    for (const m of trimmedHistory) {
      if (m.role === "system") continue;
      out.push({ role: m.role, content: m.content });
    }
    let prompt = userText;
    if (mode2 === "summarize") {
      prompt = `Summarize the page I'm viewing. Structure it as: a one-paragraph TL;DR, then key points as a bullet list, then any notable caveats.`;
    } else if (mode2 === "translate") {
      prompt = `Translate the main content of the page I'm viewing into ${userText || "English"}. Preserve the structure. Reply only with the translation.`;
    }
    out.push({ role: "user", content: prompt });
    return out;
  }
  function newConversation() {
    return {
      id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: "New chat",
      createdAt: Date.now(),
      messages: []
    };
  }
  function titleFrom(text) {
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > 42 ? `${clean.slice(0, 42)}\u2026` : clean || "New chat";
  }

  // extension/src/sidebar/markdown.ts
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function inline(s) {
    return s.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
  }
  function renderMarkdown(src) {
    const lines = escapeHtml(src).split("\n");
    const out = [];
    let inCode = false;
    let codeBuf = [];
    let listType = null;
    const closeList = () => {
      if (listType) {
        out.push(`</${listType}>`);
        listType = null;
      }
    };
    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        if (inCode) {
          out.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);
          codeBuf = [];
          inCode = false;
        } else {
          closeList();
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        continue;
      }
      const heading = /^(#{1,4})\s+(.*)$/.exec(line);
      if (heading) {
        closeList();
        const level = heading[1].length + 1;
        out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        continue;
      }
      const ul = /^[-*]\s+(.*)$/.exec(line);
      if (ul) {
        if (listType !== "ul") {
          closeList();
          out.push("<ul>");
          listType = "ul";
        }
        out.push(`<li>${inline(ul[1])}</li>`);
        continue;
      }
      const ol = /^\d+[.)]\s+(.*)$/.exec(line);
      if (ol) {
        if (listType !== "ol") {
          closeList();
          out.push("<ol>");
          listType = "ol";
        }
        out.push(`<li>${inline(ol[1])}</li>`);
        continue;
      }
      const quote = /^&gt;\s?(.*)$/.exec(line);
      if (quote) {
        closeList();
        out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
        continue;
      }
      if (line.trim() === "") {
        closeList();
        continue;
      }
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
    if (inCode && codeBuf.length) out.push(`<pre><code>${codeBuf.join("\n")}</code></pre>`);
    closeList();
    return out.join("");
  }

  // extension/src/sidebar/panel.ts
  var $ = (sel) => document.querySelector(sel);
  var settings;
  var providers = [];
  var conversation = newConversation();
  var mode = "chat";
  var pageContext = null;
  var contextDismissed = false;
  var streaming = false;
  function addMessageEl(cls, content) {
    const el = document.createElement("div");
    el.className = `msg ${cls}`;
    if (cls === "assistant") el.innerHTML = renderMarkdown(content);
    else el.textContent = content;
    $("#empty-state")?.remove();
    $("#messages").appendChild(el);
    $("#messages").scrollTop = $("#messages").scrollHeight;
    return el;
  }
  async function loadPageContext() {
    if (!settings.sidebar.includePageContext || contextDismissed) return;
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab?.id || !tab.url?.startsWith("http")) return;
    try {
      await browser.tabs.executeScript(tab.id, { file: "/dist/content.js" });
      const ctx = await browser.tabs.sendMessage(tab.id, { action: "content:extractPage" });
      if (ctx?.text) {
        pageContext = ctx;
        $("#ctx-pill").hidden = false;
        $("#ctx-title").textContent = ctx.title || ctx.url;
      }
    } catch {
    }
  }
  async function refreshProviders() {
    providers = await getAllProviders();
    const sel = $("#provider-select");
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
  async function refreshModels() {
    const provider = providers.find((p) => p.id === $("#provider-select").value);
    if (!provider) return;
    const sel = $("#model-select");
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
  async function send() {
    if (streaming) return;
    const input = $("#input");
    const userText = input.value.trim();
    if (mode === "chat" && !userText) return;
    if (mode === "summarize" && !pageContext) {
      addMessageEl("error", "No readable page in this window \u2014 open an article first, then hit Summarize.");
      return;
    }
    const provider = await getProvider($("#provider-select").value);
    if (!provider) return;
    if (provider.needsApiKey && !apiKeyFor(provider, settings.sidebar)) {
      addMessageEl("error", `No API key set for ${provider.name}. Open Settings \u2192 AI Sidebar to add one.`);
      return;
    }
    const model = $("#model-select").value || settings.sidebar.model;
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
    $("#send").disabled = true;
    $("#status").textContent = provider.id === "ollama" ? "Asking your local model\u2026" : "Thinking\u2026";
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
        }
      }
    );
  }
  function finishTurn(assistantText) {
    if (assistantText) {
      conversation.messages.push({ role: "assistant", content: assistantText, timestamp: Date.now() });
      if (conversation.messages.filter((m) => m.role === "user").length === 1) {
        conversation.title = titleFrom(conversation.messages[0].content);
      }
    }
    streaming = false;
    $("#send").disabled = false;
    $("#status").textContent = "";
    void persistConversation();
  }
  async function persistConversation() {
    const all = await getItem("aggle-conversations", []);
    const idx = all.findIndex((c) => c.id === conversation.id);
    if (idx >= 0) all[idx] = conversation;
    else all.unshift(conversation);
    await setItem("aggle-conversations", all.slice(0, 30));
  }
  function autoGrow() {
    const input = $("#input");
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
  }
  function setMode(next) {
    mode = next;
    document.querySelectorAll(".mode").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    const input = $("#input");
    if (mode === "summarize") {
      input.placeholder = "Click \u27A4 to summarize the page you're viewing\u2026";
    } else if (mode === "translate") {
      input.placeholder = "Translate the page into\u2026 (English, \u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430, Deutsch\u2026)";
    } else {
      input.placeholder = "Ask about this page, or anything\u2026";
    }
  }
  function bindChips(root) {
    root.querySelectorAll(".chip").forEach(
      (c) => c.addEventListener("click", () => {
        $("#input").value = c.dataset.fill ?? "";
        autoGrow();
        $("#input").focus();
      })
    );
  }
  function bindUI() {
    $("#provider-select").addEventListener("change", async (e) => {
      settings.sidebar.providerId = e.target.value;
      await refreshModels();
    });
    $("#model-select").addEventListener("change", (e) => {
      settings.sidebar.model = e.target.value;
    });
    document.querySelectorAll(".mode").forEach(
      (b) => b.addEventListener("click", () => setMode(b.dataset.mode))
    );
    bindChips(document);
    const input = $("#input");
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
  function buildEmptyState() {
    const el = document.createElement("div");
    el.className = "empty";
    el.id = "empty-state";
    el.innerHTML = `
    <div class="empty-mark">\u25B2</div>
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
    browser.tabs.onActivated.addListener(() => {
      contextDismissed = false;
      pageContext = null;
      $("#ctx-pill").hidden = true;
      void loadPageContext();
    });
  })();
})();
//# sourceMappingURL=panel.js.map
