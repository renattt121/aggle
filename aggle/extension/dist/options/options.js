"use strict";
(() => {
  // extension/src/utils/constants.ts
  var BACKGROUND_PRESETS = [
    { id: "ember", label: "Ember", from: "#FF5A1F", to: "#FF8A3D" },
    { id: "frost", label: "Frost", from: "#5EA0FF", to: "#E8F1FF" },
    { id: "void", label: "Void", from: "#1A1A1E", to: "#0A0A0A" }
  ];
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
  var PROFILE_PRESETS = {
    eco: { processCount: 4, diskCacheMb: 256, hwVideoDecode: false, webRender: true },
    balanced: { processCount: 8, diskCacheMb: 512, hwVideoDecode: true, webRender: true },
    performance: { processCount: 12, diskCacheMb: 2048, hwVideoDecode: true, webRender: true }
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
  async function saveSettings(settings2) {
    await browser.storage.local.set({ [STORAGE_KEY]: settings2 });
  }

  // extension/src/utils/prefs.ts
  function profileToUserJs(perf) {
    const cacheBytes = perf.diskCacheMb * 1024;
    return [
      "// Aggle resource profile (drop into <profile>/user.js or librewolf.overrides.cfg)",
      `user_pref("dom.ipc.processCount", ${perf.processCount});`,
      `user_pref("browser.cache.disk.capacity", ${cacheBytes});`,
      `user_pref("browser.cache.disk.enable", ${perf.diskCacheMb > 0 ? "true" : "false"});`,
      `user_pref("media.hardware-video-decoding.enabled", ${perf.hwVideoDecode});`,
      `user_pref("gfx.webrender.all", ${perf.webRender});`
    ].join("\n");
  }

  // extension/src/options/options.ts
  var $ = (sel) => document.querySelector(sel);
  var settings;
  var saveTimer;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(async () => {
      await saveSettings(settings);
      const toast = $("#toast");
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1400);
    }, 400);
  }
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      $(`#tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
  function applyThemePreview() {
    const { theme } = settings;
    const sat = theme.accentSaturation;
    const hue = theme.accentHue;
    const accent = `hsl(${hue} ${sat}% 55%)`;
    const accent2 = `hsl(${hue} ${sat}% 67%)`;
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-2", accent2);
    document.body.classList.toggle("oled", theme.mode === "oled");
    const preset = BACKGROUND_PRESETS.find((p) => p.id === theme.backgroundPreset) ?? BACKGROUND_PRESETS[0];
    const preview = $("#accent-preview");
    preview.style.background = theme.backgroundPreset === "void" ? `linear-gradient(135deg, ${preset.from}, ${preset.to})` : `linear-gradient(135deg, ${accent}, ${accent2})`;
  }
  function bindAppearance() {
    document.querySelectorAll(`input[name="mode"]`).forEach(
      (r) => r.addEventListener("change", () => {
        settings.theme.mode = r.value;
        applyThemePreview();
        scheduleSave();
      })
    );
    const hue = $("#accent-hue");
    const sat = $("#accent-sat");
    hue.addEventListener("input", () => {
      settings.theme.accentHue = +hue.value;
      $("#accent-hue-out").textContent = `${hue.value}\xB0`;
      applyThemePreview();
      scheduleSave();
    });
    sat.addEventListener("input", () => {
      settings.theme.accentSaturation = +sat.value;
      $("#accent-sat-out").textContent = `${sat.value}%`;
      applyThemePreview();
      scheduleSave();
    });
    const blur = $("#blur");
    blur.addEventListener("input", () => {
      settings.theme.blurIntensity = +blur.value;
      $("#blur-out").textContent = `${blur.value}px`;
      scheduleSave();
    });
    const grain = $("#grain");
    grain.addEventListener("input", () => {
      settings.theme.grainOpacity = +grain.value;
      $("#grain-out").textContent = `${grain.value}%`;
      scheduleSave();
    });
    document.querySelectorAll(`input[name="preset"]`).forEach(
      (r) => r.addEventListener("change", () => {
        settings.theme.backgroundPreset = r.value;
        applyThemePreview();
        scheduleSave();
      })
    );
    $("#custom-newtab").addEventListener("change", (e) => {
      settings.general.customNewTab = e.target.checked;
      scheduleSave();
    });
    $("#export-theme").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(settings.theme, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aggle-theme.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  function syncProviderCards() {
    const id = settings.sidebar.providerId;
    for (const card of ["ollama", "groq", "openai", "xai"]) {
      $(`#card-${card}`).style.display = card === id ? "" : "none";
    }
  }
  function bindAI() {
    const provider = $("#provider-select");
    provider.addEventListener("change", () => {
      settings.sidebar.providerId = provider.value;
      syncProviderCards();
      scheduleSave();
    });
    const model = $("#model-input");
    model.addEventListener("input", () => {
      settings.sidebar.model = model.value.trim();
      scheduleSave();
    });
    const bindSecret = (sel, key) => {
      const el = $(sel);
      el.addEventListener("input", () => {
        settings.sidebar[key] = el.value;
        scheduleSave();
      });
    };
    bindSecret("#key-groq", "apiKeyGroq");
    bindSecret("#key-openai", "apiKeyOpenai");
    bindSecret("#key-xai", "apiKeyXai");
    $("#ollama-url").addEventListener("input", (e) => {
      settings.sidebar.ollamaUrl = e.target.value.trim();
      scheduleSave();
    });
    $("#include-context").addEventListener("change", (e) => {
      settings.sidebar.includePageContext = e.target.checked;
      scheduleSave();
    });
  }
  function renderLists() {
    const wrap = $("#filter-lists");
    wrap.innerHTML = "";
    for (const list of settings.blocker.lists) {
      const row = document.createElement("div");
      row.className = "list-item";
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = list.enabled;
      toggle.addEventListener("change", () => {
        list.enabled = toggle.checked;
        scheduleSave();
      });
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = list.name;
      const sub = document.createElement("span");
      sub.className = "sub";
      sub.textContent = list.bundled ? "bundled" : list.url;
      if (!list.bundled) {
        const rm = document.createElement("button");
        rm.className = "remove";
        rm.textContent = "\u2715";
        rm.title = "Remove list";
        rm.addEventListener("click", () => {
          settings.blocker.lists = settings.blocker.lists.filter((l) => l.id !== list.id);
          renderLists();
          scheduleSave();
        });
        row.append(toggle, name, sub, rm);
      } else {
        row.append(toggle, name, sub);
      }
      wrap.appendChild(row);
    }
    const wl = $("#whitelist");
    wl.innerHTML = "";
    if (settings.blocker.whitelist.length === 0) {
      wl.innerHTML = `<p class="hint">No whitelisted sites \u2014 the blocker is active everywhere.</p>`;
    }
    for (const host of settings.blocker.whitelist) {
      const row = document.createElement("div");
      row.className = "list-item";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = host;
      const rm = document.createElement("button");
      rm.className = "remove";
      rm.textContent = "\u2715";
      rm.addEventListener("click", () => {
        settings.blocker.whitelist = settings.blocker.whitelist.filter((h) => h !== host);
        renderLists();
        scheduleSave();
      });
      row.append(name, rm);
      wl.appendChild(row);
    }
  }
  function bindPrivacy() {
    $("#blocker-enabled").addEventListener("change", (e) => {
      settings.blocker.enabled = e.target.checked;
      scheduleSave();
    });
    $("#add-list").addEventListener("click", () => {
      const name = $("#new-list-name").value.trim();
      const url = $("#new-list-url").value.trim();
      if (!name || !url.startsWith("http")) return;
      settings.blocker.lists.push({
        id: `list-${Date.now()}`,
        name,
        url,
        enabled: true,
        bundled: false,
        ruleCount: 0,
        lastUpdated: 0
      });
      $("#new-list-name").value = "";
      $("#new-list-url").value = "";
      renderLists();
      scheduleSave();
    });
    $("#add-whitelist").addEventListener("click", () => {
      const host = $("#new-whitelist-host").value.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      if (!host || settings.blocker.whitelist.includes(host)) return;
      settings.blocker.whitelist.push(host);
      $("#new-whitelist-host").value = "";
      renderLists();
      scheduleSave();
    });
  }
  function bindPerformance() {
    document.querySelectorAll(`input[name="profile"]`).forEach(
      (r) => r.addEventListener("change", () => {
        const id = r.value;
        settings.performance.profile = id;
        if (id !== "custom" && PROFILE_PRESETS[id]) {
          Object.assign(settings.performance, PROFILE_PRESETS[id]);
          fillPerformanceFields();
        }
        $("#custom-profile-card").style.display = id === "custom" ? "" : "none";
        scheduleSave();
      })
    );
    const pc = $("#process-count");
    pc.addEventListener("input", () => {
      settings.performance.processCount = +pc.value;
      settings.performance.profile = "custom";
      checkProfileRadio();
      $("#process-count-out").textContent = pc.value;
      scheduleSave();
    });
    const dc = $("#disk-cache");
    dc.addEventListener("input", () => {
      settings.performance.diskCacheMb = +dc.value;
      settings.performance.profile = "custom";
      checkProfileRadio();
      $("#disk-cache-out").textContent = dc.value;
      scheduleSave();
    });
    $("#hw-video").addEventListener("change", (e) => {
      settings.performance.hwVideoDecode = e.target.checked;
      settings.performance.profile = "custom";
      checkProfileRadio();
      scheduleSave();
    });
    $("#webrender").addEventListener("change", (e) => {
      settings.performance.webRender = e.target.checked;
      settings.performance.profile = "custom";
      checkProfileRadio();
      scheduleSave();
    });
    $("#copy-userjs").addEventListener("click", async () => {
      await navigator.clipboard.writeText(profileToUserJs(settings.performance));
      const btn = $("#copy-userjs");
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy user.js snippet", 1500);
    });
  }
  function checkProfileRadio() {
    document.querySelectorAll(`input[name="profile"]`).forEach((r) => {
      r.checked = r.value === settings.performance.profile;
    });
    $("#custom-profile-card").style.display = settings.performance.profile === "custom" ? "" : "none";
  }
  function fillPerformanceFields() {
    $("#process-count").value = String(settings.performance.processCount);
    $("#process-count-out").textContent = String(settings.performance.processCount);
    $("#disk-cache").value = String(settings.performance.diskCacheMb);
    $("#disk-cache-out").textContent = String(settings.performance.diskCacheMb);
    $("#hw-video").checked = settings.performance.hwVideoDecode;
    $("#webrender").checked = settings.performance.webRender;
    checkProfileRadio();
  }
  async function renderShortcuts() {
    const cmds = await browser.commands.getAll();
    const wrap = $("#shortcut-list");
    wrap.innerHTML = "";
    for (const cmd of cmds) {
      const row = document.createElement("div");
      row.className = "list-item";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = cmd.description ?? cmd.name ?? "";
      const key = document.createElement("span");
      key.className = "kbd";
      key.textContent = cmd.shortcut ?? "not set";
      row.append(name, key);
      wrap.appendChild(row);
    }
  }
  function fillFields() {
    const { theme, sidebar, blocker, general } = settings;
    document.querySelectorAll(`input[name="mode"]`).forEach((r) => {
      r.checked = r.value === theme.mode;
    });
    $("#accent-hue").value = String(theme.accentHue);
    $("#accent-hue-out").textContent = `${theme.accentHue}\xB0`;
    $("#accent-sat").value = String(theme.accentSaturation);
    $("#accent-sat-out").textContent = `${theme.accentSaturation}%`;
    $("#blur").value = String(theme.blurIntensity);
    $("#blur-out").textContent = `${theme.blurIntensity}px`;
    $("#grain").value = String(theme.grainOpacity);
    $("#grain-out").textContent = `${theme.grainOpacity}%`;
    document.querySelectorAll(`input[name="preset"]`).forEach((r) => {
      r.checked = r.value === theme.backgroundPreset;
    });
    $("#custom-newtab").checked = general.customNewTab;
    $("#provider-select").value = sidebar.providerId;
    $("#model-input").value = sidebar.model;
    $("#ollama-url").value = sidebar.ollamaUrl;
    $("#key-groq").value = sidebar.apiKeyGroq;
    $("#key-openai").value = sidebar.apiKeyOpenai;
    $("#key-xai").value = sidebar.apiKeyXai;
    $("#include-context").checked = sidebar.includePageContext;
    $("#blocker-enabled").checked = blocker.enabled;
    fillPerformanceFields();
  }
  (async () => {
    settings = await getSettings();
    fillFields();
    applyThemePreview();
    syncProviderCards();
    renderLists();
    renderShortcuts();
    bindAppearance();
    bindAI();
    bindPrivacy();
    bindPerformance();
  })();
})();
//# sourceMappingURL=options.js.map
