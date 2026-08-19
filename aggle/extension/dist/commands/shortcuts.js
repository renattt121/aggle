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

  // extension/src/blocker/parser.ts
  var idCounter = 0;
  function toRegex(pattern, isException) {
    const clean = pattern.replace(/([^a-zA-Z0-9])$/g, "$1").replace(/\$\w(?:=[^$]+)?$/g, "").trim();
    if (clean.startsWith("||")) {
      let host = clean.slice(2).replace(/[*^?]/g, "");
      host = host.replace(/\/$/, "");
      const re = new RegExp(`(?:^https?://(?:.*\\.)?${host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`);
      return isException ? null : re;
    }
    if (clean.startsWith("|")) {
      const substr = clean.slice(1).replace(/[*^?]/g, "");
      if (!isException) return new RegExp(substr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      return null;
    }
    if (clean.includes("*")) {
      const esc = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("^" + esc.replace(/\*/g, ".*") + "$", "i");
      return isException ? null : re;
    }
    const exact = clean.replace(/[^a-zA-Z0-9._-]/g, "\\$&");
    if (!isException) return new RegExp(exact, "i");
    return null;
  }
  function parseRule(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("[")) return null;
    const isException = trimmed.startsWith("@@");
    const pattern = isException ? trimmed.slice(2).trim() : trimmed;
    const regex = toRegex(pattern, false);
    let domain;
    const dm = /^\\|\\|([^/^*]+)\^?\$/.exec(trimmed);
    if (dm) domain = dm[1];
    return {
      id: `f-${++idCounter}`,
      type: "network",
      pattern,
      regex,
      domain,
      isException: false
    };
  }
  function parseFilterList(text) {
    return text.split("\n").map(parseRule).filter(Boolean);
  }

  // extension/src/blocker/lists.ts
  var BUNDLED_FILTERS = `
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
`;

  // extension/src/blocker/engine.ts
  var activeRules = [];
  var whitelist = [];
  var enabled = true;
  var totalBlocked = 0;
  var blockedToday = 0;
  var lastResetDate = "";
  function today() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  async function loadState() {
    const s = await getSettings();
    enabled = s.blocker.enabled;
    whitelist = s.blocker.whitelist;
    totalBlocked = s.blocker.stats.totalBlocked;
    blockedToday = s.blocker.stats.blockedToday;
    lastResetDate = s.blocker.stats.lastResetDate;
    activeRules = [];
  }
  function resetIfNeeded() {
    const dt = today();
    if (lastResetDate !== dt) {
      blockedToday = 0;
      lastResetDate = dt;
    }
  }
  async function rebuildRules() {
    const s = await getSettings();
    const pool = [];
    for (const f of parseFilterList(BUNDLED_FILTERS)) {
      if (f.regex) pool.push(f.regex);
    }
    for (const list of s.blocker.lists) {
      if (!list.enabled) continue;
      const rules = list.rules;
      for (const f of rules) {
        if (f.regex) pool.push(f.regex);
      }
    }
    activeRules = pool;
  }
  function matchesAny(url) {
    for (const re of activeRules) {
      if (re.test(url)) return true;
    }
    return false;
  }
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (!enabled) return void 0;
      resetIfNeeded();
      const url = details.url;
      const hostname = (new URL(url).hostname ?? "").replace(/^www\./, "");
      if (whitelist.includes(hostname)) return void 0;
      if (matchesAny(url)) {
        totalBlocked++;
        blockedToday++;
        const newStats = {
          totalBlocked,
          blockedToday,
          lastResetDate,
          perSite: {}
        };
        browser.storage.local.set({ "aggle-blocker-stats": newStats });
        return { cancel: true };
      }
      return void 0;
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
  var blockerEngine = {
    loadState,
    rebuildRules,
    getStats: () => ({
      enabled,
      totalBlocked,
      blockedToday
    })
  };

  // extension/src/blocker/ui.ts
  var BADGE_COLORS = { off: "#52525B", on: "#FF5A1F" };
  async function refreshBadge() {
    const s = await getSettings();
    if (!s.blocker.enabled) {
      browser.browserAction.setBadgeText({ text: "OFF" });
      browser.browserAction.setBadgeBackgroundColor({ color: BADGE_COLORS.off });
      return;
    }
    const stats = blockerEngine.getStats();
    if (stats.blockedToday > 0) {
      const n = stats.blockedToday > 9999 ? "9k+" : String(stats.blockedToday);
      browser.browserAction.setBadgeText({ text: n });
    } else {
      browser.browserAction.setBadgeText({ text: "" });
    }
    browser.browserAction.setBadgeBackgroundColor({ color: BADGE_COLORS.on });
  }
  async function toggleBlocker(on) {
    const s = await getSettings();
    await browser.storage.local.set({
      "aggle-settings": {
        ...s,
        blocker: { ...s.blocker, enabled: on }
      }
    });
    if (on) await blockerEngine.rebuildRules();
    void refreshBadge();
  }

  // extension/src/commands/shortcuts.ts
  browser.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-blocker-site") {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.url) return;
      const host = new URL(tab.url).hostname.replace(/^www\./, "");
      const s = await getSettings();
      const isWhitelisted = s.blocker.whitelist.includes(host);
      await toggleBlocker(!isWhitelisted);
    }
  });
})();
//# sourceMappingURL=shortcuts.js.map
