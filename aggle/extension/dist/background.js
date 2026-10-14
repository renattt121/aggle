"use strict";
(() => {
  var k = {
    theme: {
      mode: "dark",
      accentHue: 18,
      accentSaturation: 100,
      blurIntensity: 24,
      grainOpacity: 15,
      backgroundPreset: "ember",
    },
    sidebar: {
      providerId: "ollama",
      model: "llama3.1",
      apiKeyGroq: "",
      apiKeyOpenai: "",
      apiKeyGemini: "",
      apiKeyXai: "",
      apiKeyCustomOpenai: "",
      ollamaUrl: "http://localhost:11434",
      customOpenaiUrl: "http://localhost:1234/v1",
      includePageContext: !0,
    },
    blocker: {
      enabled: !0,
      lists: [
        {
          id: "aggle-builtin",
          name: "Aggle Base List",
          url: "bundled:base",
          enabled: !0,
          bundled: !0,
          ruleCount: 0,
          lastUpdated: 0,
        },
      ],
      whitelist: [],
      stats: {
        totalBlocked: 0,
        blockedToday: 0,
        lastResetDate: "",
        perSite: {},
      },
    },
    performance: {
      profile: "balanced",
      processCount: 8,
      diskCacheMb: 512,
      hwVideoDecode: !0,
      webRender: !0,
    },
    general: {
      customNewTab: !0,
      commandPaletteEnabled: !0,
      searchEngine: "duckduckgo",
    },
  };
  var u = "aggle-settings";
  function p(e, t) {
    if (t == null) return e;
    if (
      typeof e != "object" ||
      Array.isArray(e) ||
      typeof t != "object" ||
      Array.isArray(t)
    )
      return t;
    let r = { ...e };
    for (let [s, o] of Object.entries(t)) r[s] = s in e ? p(e[s], o) : o;
    return r;
  }
  async function n() {
    let e = await browser.storage.local.get(u);
    return p(k, e[u]);
  }
  async function T(e) {
    await browser.storage.local.set({ [u]: e });
  }
  async function y(e) {
    let t = await n(),
      r = p(t, e);
    return (await T(r), r);
  }
  var F = 0;
  function E(e, t) {
    let r = e.replace(/\$[a-zA-Z][a-zA-Z0-9_-]*(?:=[^$]*)?/g, "").trim();
    if (r.startsWith("||")) {
      let o = r.slice(2).replace(/[*^?]/g, "");
      o = o.replace(/\/$/, "");
      let i = new RegExp(
        `(?:^https?://(?:.*\\.)?${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      );
      return t ? null : i;
    }
    if (r.startsWith("|")) {
      let o = r.slice(1).replace(/[*^?]/g, "");
      return t
        ? null
        : new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }
    if (r.includes("*")) {
      let o = r
          .replace(/[*]/g, "\0")
          .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\x00/g, ".*"),
        i = new RegExp("^" + o + "$", "i");
      return t ? null : i;
    }
    let s = r.replace(/[^a-zA-Z0-9._-]/g, "\\$&");
    return t
      ? null
      : new RegExp("(?:^|[^a-zA-Z0-9._-])" + s + "(?:$|[^a-zA-Z0-9._-])", "i");
  }
  function P(e) {
    let t = e.trim();
    if (!t || t.startsWith("!") || t.startsWith("[")) return null;
    let r = t.startsWith("@@"),
      s = r ? t.slice(2).trim() : t,
      o = E(s, !1),
      i,
      h = /^\\|\\|([^/^*]+)\^?\$/.exec(t);
    return (
      h && (i = h[1]),
      {
        id: `f-${++F}`,
        type: "network",
        pattern: s,
        regex: o,
        domain: i,
        isException: r,
      }
    );
  }
  function A(e) {
    return e
      .split(
        `
`,
      )
      .map(P)
      .filter(Boolean);
  }
  var R = `
! Aggle bundled base list \u2014 v0.1.0
! Covers the most common ad and tracker domains.
! Full EasyList-compatible lists can be added from Settings.
!
! Ads / tracking
||doubleclick.net^$third-party
||googlesyndication.com^$third-party
||googletagmanager.com^$third-party
||google-analytics.com^$third-party
||facebook.net^$third-party
||facebook.com^$third-party
||fbcdn.net^$third-party
||analytics.yahoo.com^$third-party
||scorecardresearch.com^$third-party
||mixpanel.com^$third-party
||intercom.io^$third-party
||criteo.com^$third-party
||adnxs.com^$third-party
||pubmatic.com^$third-party
||openx.net^$third-party
||amazon-adsystem.com^$third-party
||clickbank.net^$third-party
||cj.com^$third-party
||impact.com^$third-party
||shareasale.com^$third-party
||tradedoubler.com^$third-party
||quantserve.com^$third-party
||hotjar.com^$third-party
||segment.com^$third-party
||klarna.com^$third-party
||tiktok.com^$third-party
||snapchat.com^$third-party
!
! Analytics
||mixpanel.com^$third-party
||fullstory.com^$third-party
||hotjar.com^$third-party
||matomo.org^$third-party
||piwik.org^$third-party
!
! Crypto miners (coinhive etc.)
||coinhive.com^
||minero.pw^
||nohash.life^
|https://coinhive.com/
|https://minero.pw/
  }
});

`;
  var m = [],
    S = [],
    w = !0,
    g = 0,
    l = 0,
    b = "";
  function C() {
    return new Date().toISOString().slice(0, 10);
  }
  async function B() {
    let e = await n();
    ((w = e.blocker.enabled),
      (S = e.blocker.whitelist),
      (g = e.blocker.stats.totalBlocked),
      (l = e.blocker.stats.blockedToday),
      (b = e.blocker.stats.lastResetDate),
      (m = []));
  }
  function I() {
    let e = C();
    b !== e && ((l = 0), (b = e));
  }
  async function L() {
    let e = await n(),
      t = [];
    for (let r of A(R)) r.regex && t.push(r.regex);
    for (let r of e.blocker.lists) {
      if (!r.enabled) continue;
      let s = r.rules;
      for (let o of s) o.regex && t.push(o.regex);
    }
    m = t;
  }
  function U(e) {
    for (let t of m) if (t.test(e)) return !0;
    return !1;
  }
  let perSiteStats = {};
  let lastStorageUpdate = Date.now();
  
  // Load perSite stats initially
  browser.storage.local.get("aggle-blocker-stats").then((res) => {
    if (res["aggle-blocker-stats"] && res["aggle-blocker-stats"].perSite) {
      perSiteStats = res["aggle-blocker-stats"].perSite;
    }
  });

  function updateStorageThrottled() {
    let now = Date.now();
    if (now - lastStorageUpdate > 2000) {
      lastStorageUpdate = now;
      let s = {
        totalBlocked: g,
        blockedToday: l,
        lastResetDate: b,
        perSite: perSiteStats,
      };
      browser.storage.local.set({ "aggle-blocker-stats": s });
    }
  }

  browser.webRequest.onBeforeRequest.addListener(
    (e) => {
      if (!w) return;
      I();
      let t = e.url;
      let reqHostname = "";
      let originHostname = "";
      
      try {
        reqHostname = new URL(t).hostname;
        if (e.originUrl || e.documentUrl) {
          originHostname = new URL(e.originUrl || e.documentUrl).hostname.replace(/^www\./, "");
        }
      } catch (e) {}

      // Do not block top level domain if it's whitelisted
      if (originHostname && S.includes(originHostname)) return;

      if (U(t)) {
        g++; l++;
        if (originHostname) {
          perSiteStats[originHostname] = (perSiteStats[originHostname] || 0) + 1;
        }
        updateStorageThrottled();
        return { cancel: !0 };
      }
    },
    { urls: ["<all_urls>"] },
    ["blocking"],
  );
  var a = {
    loadState: B,
    rebuildRules: L,
    getStats: () => ({ enabled: w, totalBlocked: g, blockedToday: l }),
  };
  var $ = { off: "#52525B", on: "#FF5A1F" };
  async function c() {
    if (!(await n()).blocker.enabled) {
      (browser.browserAction.setBadgeText({ text: "OFF" }),
        browser.browserAction.setBadgeBackgroundColor({ color: $.off }));
      return;
    }
    let t = a.getStats();
    if (t.blockedToday > 0) {
      let r = t.blockedToday > 9999 ? "9k+" : String(t.blockedToday);
      browser.browserAction.setBadgeText({ text: r });
    } else browser.browserAction.setBadgeText({ text: "" });
    browser.browserAction.setBadgeBackgroundColor({ color: $.on });
  }
  async function q() {
    let [e] = await browser.tabs.query({ active: !0, currentWindow: !0 });
    if (e?.id !== void 0)
      try {
        await browser.tabs.sendMessage(e.id, { action: "palette:open" });
        return;
      } catch {}
    let t = await browser.tabs.create({
      url: "src/newtab/newtab.html",
      active: !0,
    });
    t?.id !== void 0 &&
      setTimeout(() => {
        browser.tabs
          .sendMessage(t.id, { action: "palette:open" })
          .catch(() => {});
      }, 300);
  }
  async function x() {
    let [e] = await browser.tabs.query({ active: !0, currentWindow: !0 }),
      t = "";
    try {
      t = new URL(e?.url ?? "").hostname.replace(/^www\./, "");
    } catch {
      return;
    }
    if (!t) return;
    let r = await n(),
      s = r.blocker.whitelist ?? [],
      o = s.includes(t);
    (await y({
      blocker: {
        ...r.blocker,
        whitelist: o ? s.filter((i) => i !== t) : [...s, t],
      },
    }),
      await a.loadState(),
      await a.rebuildRules(),
      c());
  }
  async function f() {
    try {
      return (await browser.sidebarAction.toggle(), "toggled");
    } catch {
      try {
        return (await browser.sidebarAction.isOpen({}))
          ? (await browser.sidebarAction.close(), "closed")
          : (await browser.sidebarAction.open(), "opened");
      } catch (e) {
        return "error: " + String(e);
      }
    }
  }
  browser.commands.onCommand.addListener(async (e) => {
    switch (e) {
      case "open-stats":
        await browser.tabs.create({
          url: "aggle:stats",
          active: !0,
        });
        break;
      case "open-palette":
        await q();
        break;
      case "toggle-ai-sidebar":
        await f();
        break;
      case "toggle-blocker-site":
        await x();
        break;
    }
  });
  browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
  });
  (async () => (await a.loadState(), await a.rebuildRules(), c()))();
  browser.runtime.onMessage.addListener((e, t) => {
    if (e.action === "proxyFetch") {
      return fetch(e.url, e.init)
        .then((res) =>
          res
            .text()
            .then((text) => ({ ok: res.ok, status: res.status, text: text })),
        )
        .catch((err) => ({ error: err.toString() }));
    }
    switch (e.action) {
      case "blocker:getState": {
        let r = a.getStats();
        return Promise.resolve({ ...r, totalBlocked: r.totalBlocked });
      }
      case "blocker:toggle":
        return (a.rebuildRules(), c(), Promise.resolve({ ok: !0 }));
      case "blocker:getStats":
        return Promise.resolve(a.getStats());
      case "stats:getTabInfo":
        return browser.tabs.query({}).then((r) => {
          let s = r.map((o) => ({
            id: o.id,
            title: o.title ?? "",
            url: o.url ?? "",
            hostname: (() => {
              try {
                return new URL(o.url ?? "").hostname;
              } catch {
                return "";
              }
            })(),
            discarded: o.discarded ?? !1,
            blockedCount: 0,
          }));
          return Promise.resolve({ tabCount: s.length, tabs: s });
        });
      case "stats:unloadTab":
        return browser.tabs.reload(e.tabId, { bypassCache: !0 });
      case "sidebar:opened":
        return Promise.resolve({ ok: !0 });
      case "sidebar:toggle":
        return f().then((r) => ({ ok: !0, status: r }));
      case "openTab":
        return (
          e.url
            ? browser.tabs.create({ url: e.url, active: !0 })
            : browser.tabs.create({ active: !0 }),
          Promise.resolve({ ok: !0 })
        );
      case "newPrivateWindow":
        return (
          browser.windows.create({
            incognito: !0,
            url: browser.runtime.getURL("src/newtab/private.html"),
          }),
          Promise.resolve({ ok: !0 })
        );
      case "toggleSidebar":
        return f().then((r) => ({ ok: !0, status: r }));
      case "toggleBlocker":
        return x().then(() => ({ ok: !0 }));
    }
  });
  browser.tabs.onUpdated.addListener(() => {
    c();
  });
  browser.tabs.onActivated.addListener(() => {
    c();
  });
  var d = "duckduckgo";
  n().then((e) => {
    d = e.general?.searchEngine || "duckduckgo";
  });
  browser.storage.onChanged.addListener((e, t) => {
    t === "local" &&
      e["aggle-settings"] &&
      (d = e["aggle-settings"].newValue?.general?.searchEngine || "duckduckgo");
  });
  var v = {
    duckduckgo: (e) => `https://duckduckgo.com/?q=${encodeURIComponent(e)}`,
    google: (e) => `https://www.google.com/search?q=${encodeURIComponent(e)}`,
    bing: (e) => `https://www.bing.com/search?q=${encodeURIComponent(e)}`,
    brave: (e) => `https://search.brave.com/search?q=${encodeURIComponent(e)}`,
    startpage: (e) =>
      `https://www.startpage.com/do/search?query=${encodeURIComponent(e)}`,
    ecosia: (e) => `https://www.ecosia.org/search?q=${encodeURIComponent(e)}`,
    kagi: (e) => `https://kagi.com/search?q=${encodeURIComponent(e)}`,
    youtube: (e) =>
      `https://www.youtube.com/results?search_query=${encodeURIComponent(e)}`,
  };
  browser.webRequest.onBeforeRequest.addListener(
    (e) => {
      if (e.type !== "main_frame" || d === "duckduckgo") return {};
      try {
        let t = new URL(e.url);
        if (t.hostname === "duckduckgo.com" && t.pathname === "/") {
          let r = t.searchParams.get("q");
          if (r && v[d]) return { redirectUrl: v[d](r) };
        }
      } catch {}
      return {};
    },
    { urls: ["https://duckduckgo.com/*"] },
    ["blocking"]
  );

  // Web Panel: strip X-Frame-Options & adjust CSP frame-ancestors for embedded sidebar panels
  browser.webRequest.onHeadersReceived.addListener(
    (details) => {
      if (details.type === "sub_frame" || (details.frameId !== undefined && details.frameId > 0)) {
        let headers = details.responseHeaders || [];
        headers = headers.filter((h) => {
          const name = h.name.toLowerCase();
          return (
            name !== "x-frame-options" &&
            name !== "frame-options" &&
            name !== "cross-origin-opener-policy"
          );
        });
        for (const h of headers) {
          const name = h.name.toLowerCase();
          if (name === "content-security-policy" || name === "content-security-policy-report-only") {
            h.value = h.value.replace(/frame-ancestors\s+[^;]+(;|$)/gi, "");
          }
        }
        return { responseHeaders: headers };
      }
      return {};
    },
    { urls: ["<all_urls>"] },
    ["blocking", "responseHeaders"]
  );
  // Web Panel: Intercept embedded OAuth / Google sign-in attempts from sub_frames
  // and open them in a top-level tab to avoid Google's "401 Malformed Request" iframe security block.
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.type === "sub_frame" || (details.frameId !== undefined && details.frameId > 0)) {
        try {
          const urlObj = new URL(details.url);
          const host = urlObj.hostname.toLowerCase();
          if (
            host === "accounts.google.com" ||
            host.endsWith(".accounts.google.com") ||
            host === "auth.openai.com" ||
            host === "appleid.apple.com"
          ) {
            browser.tabs.create({ url: details.url, active: true });
            return { cancel: true };
          }
        } catch {}
      }
      return {};
    },
    {
      urls: [
        "*://accounts.google.com/*",
        "*://*.accounts.google.com/*",
        "*://auth.openai.com/*",
        "*://appleid.apple.com/*"
      ]
    },
    ["blocking"]
  );

  // Sync sidebar session when an authentication tab completes
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      try {
        const u = new URL(tab.url);
        if (
          u.hostname === "gemini.google.com" ||
          u.hostname === "chatgpt.com" ||
          u.hostname === "claude.ai" ||
          u.hostname === "duck.ai"
        ) {
          browser.runtime.sendMessage({ action: "panel:reloadService" }).catch(() => {});
        }
      } catch {}
    }
  });
})();
// FIRST-RUN SETUP INJECTION
(async () => {
  try {
    let state = await browser.storage.local.get("aggle-first-run-done");
    if (!state["aggle-first-run-done"]) {
      await browser.storage.local.set({ "aggle-first-run-done": true });
      setTimeout(async () => {
        // Fix the background tab bug: replace LibreWolf's default about:newtab with our actual newtab.html
        let tabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabs && tabs.length > 0) {
          browser.tabs.update(tabs[0].id, {
            url: browser.runtime.getURL("src/newtab/newtab.html"),
          });
        }

        // Open the popup setup screen
        browser.windows.create({
          url: browser.runtime.getURL("dist/firstrun/first-run.html"),
          type: "popup",
          width: 600,
          height: 750,
        });
      }, 500);
    }
  } catch (e) {
    console.error(e);
  }
})();
browser.tabs.onCreated.addListener((tab) => {
  if (
    tab.incognito &&
    (tab.url === "about:privatebrowsing" ||
      tab.url === "about:newtab" ||
      tab.url === "about:home")
  ) {
    browser.tabs
      .update(tab.id, {
        url: browser.runtime.getURL("src/newtab/private.html"),
      })
      .catch(() => {});
  }
});
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    tab.incognito &&
    changeInfo.url &&
    (changeInfo.url === "about:privatebrowsing" ||
      changeInfo.url === "about:newtab")
  ) {
    browser.tabs
      .update(tabId, { url: browser.runtime.getURL("src/newtab/private.html") })
      .catch(() => {});
  }
});

// Force close sidebar on startup
browser.sidebarAction.close();

browser.runtime.onConnect.addListener((port) => {
  if (port.name !== "ai-stream") return;
  port.onMessage.addListener(async (msg) => {
    try {
      const response = await fetch(msg.url, {
        method: msg.method || "POST",
        headers: msg.headers || {},
        body: msg.body ? JSON.stringify(msg.body) : undefined,
      });
      if (!response.ok) {
        let errMessage = `${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          errMessage = errData?.error?.message ?? errMessage;
        } catch {}
        port.postMessage({ error: errMessage });
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        port.postMessage({ chunk: decoder.decode(value, { stream: true }) });
      }
      port.postMessage({ done: true });
    } catch (e) {
      port.postMessage({ error: e.toString() });
    }
  });
});

// Workspace Title Updater
(async () => {
  const WORKSPACES_KEY = "aggle-workspaces";
  const ACTIVE_WORKSPACE_KEY = "aggle-active-workspace";
  const DEFAULT_WORKSPACES = [
    { id: "personal", name: "Personal", icon: "🏠" },
    { id: "work", name: "Work", icon: "💼" },
    { id: "research", name: "Research", icon: "🧪" },
  ];

  async function updateWorkspaceTitle(activeId, workspaces) {
    const w = workspaces || DEFAULT_WORKSPACES;
    const aId = activeId || (w.length > 0 ? w[0].id : null);
    if (!aId || !w) return;
    const ws = w.find((x) => x.id === aId) || w[0];
    if (ws) {
      browser.browserAction.setTitle({ title: `${ws.icon} ${ws.name}` });
    }
  }

  // Initial update
  const res = await browser.storage.local.get([
    WORKSPACES_KEY,
    ACTIVE_WORKSPACE_KEY,
  ]);
  updateWorkspaceTitle(res[ACTIVE_WORKSPACE_KEY], res[WORKSPACES_KEY]);

  // Listen for changes
  browser.storage.onChanged.addListener((changes, area) => {
    if (
      area === "local" &&
      (changes[ACTIVE_WORKSPACE_KEY] || changes[WORKSPACES_KEY])
    ) {
      browser.storage.local
        .get([WORKSPACES_KEY, ACTIVE_WORKSPACE_KEY])
        .then((r) => {
          updateWorkspaceTitle(r[ACTIVE_WORKSPACE_KEY], r[WORKSPACES_KEY]);
        });
    }
  });
})();
