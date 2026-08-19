import { getSettings, saveSettings } from "../utils/storage";
import { BACKGROUND_PRESETS, PROFILE_PRESETS } from "../utils/constants";
import { profileToUserJs } from "../utils/prefs";
import type { AggleSettings } from "../types";

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

let settings: AggleSettings;
let saveTimer: number | undefined;

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function scheduleSave(): void {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    await saveSettings(settings);
    const toast = $("#toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1400);
  }, 400);
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");
    $(`#tab-${(btn as HTMLElement).dataset.tab}`).classList.add("active");
  });
});

// ---------------------------------------------------------------------------
// Appearance
// ---------------------------------------------------------------------------

function applyThemePreview(): void {
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
  preview.style.background = theme.backgroundPreset === "void"
    ? `linear-gradient(135deg, ${preset.from}, ${preset.to})`
    : `linear-gradient(135deg, ${accent}, ${accent2})`;
}

function bindAppearance(): void {
  document.querySelectorAll<HTMLInputElement>(`input[name="mode"]`).forEach((r) =>
    r.addEventListener("change", () => {
      settings.theme.mode = r.value as "dark" | "oled";
      applyThemePreview();
      scheduleSave();
    })
  );

  const hue = $<HTMLInputElement>("#accent-hue");
  const sat = $<HTMLInputElement>("#accent-sat");
  hue.addEventListener("input", () => {
    settings.theme.accentHue = +hue.value;
    $("#accent-hue-out").textContent = `${hue.value}°`;
    applyThemePreview();
    scheduleSave();
  });
  sat.addEventListener("input", () => {
    settings.theme.accentSaturation = +sat.value;
    $("#accent-sat-out").textContent = `${sat.value}%`;
    applyThemePreview();
    scheduleSave();
  });

  const blur = $<HTMLInputElement>("#blur");
  blur.addEventListener("input", () => {
    settings.theme.blurIntensity = +blur.value;
    $("#blur-out").textContent = `${blur.value}px`;
    scheduleSave();
  });
  const grain = $<HTMLInputElement>("#grain");
  grain.addEventListener("input", () => {
    settings.theme.grainOpacity = +grain.value;
    $("#grain-out").textContent = `${grain.value}%`;
    scheduleSave();
  });

  document.querySelectorAll<HTMLInputElement>(`input[name="preset"]`).forEach((r) =>
    r.addEventListener("change", () => {
      settings.theme.backgroundPreset = r.value as "ember" | "frost" | "void";
      applyThemePreview();
      scheduleSave();
    })
  );

  $<HTMLInputElement>("#custom-newtab").addEventListener("change", (e) => {
    settings.general.customNewTab = (e.target as HTMLInputElement).checked;
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

// ---------------------------------------------------------------------------
// AI
// ---------------------------------------------------------------------------

function syncProviderCards(): void {
  const id = settings.sidebar.providerId;
  for (const card of ["ollama", "groq", "openai", "xai"]) {
    $(`#card-${card}`).style.display = card === id ? "" : "none";
  }
}

function bindAI(): void {
  const provider = $<HTMLSelectElement>("#provider-select");
  provider.addEventListener("change", () => {
    settings.sidebar.providerId = provider.value;
    syncProviderCards();
    scheduleSave();
  });

  const model = $<HTMLInputElement>("#model-input");
  model.addEventListener("input", () => {
    settings.sidebar.model = (model as HTMLInputElement).value.trim();
    scheduleSave();
  });

  const bindSecret = (sel: string, key: "apiKeyGroq" | "apiKeyOpenai" | "apiKeyXai") => {
    const el = $(sel);
    el.addEventListener("input", () => {
      settings.sidebar[key] = (el as HTMLInputElement).value;
      scheduleSave();
    });
  };
  bindSecret("#key-groq", "apiKeyGroq");
  bindSecret("#key-openai", "apiKeyOpenai");
  bindSecret("#key-xai", "apiKeyXai");

  $<HTMLInputElement>("#ollama-url").addEventListener("input", (e) => {
    settings.sidebar.ollamaUrl = (e.target as HTMLInputElement).value.trim();
    scheduleSave();
  });

  $<HTMLInputElement>("#include-context").addEventListener("change", (e) => {
    settings.sidebar.includePageContext = (e.target as HTMLInputElement).checked;
    scheduleSave();
  });
}

// ---------------------------------------------------------------------------
// Privacy / blocker
// ---------------------------------------------------------------------------

function renderLists(): void {
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
      rm.textContent = "✕";
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
    wl.innerHTML = `<p class="hint">No whitelisted sites — the blocker is active everywhere.</p>`;
  }
  for (const host of settings.blocker.whitelist) {
    const row = document.createElement("div");
    row.className = "list-item";
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = host;
    const rm = document.createElement("button");
    rm.className = "remove";
    rm.textContent = "✕";
    rm.addEventListener("click", () => {
      settings.blocker.whitelist = settings.blocker.whitelist.filter((h) => h !== host);
      renderLists();
      scheduleSave();
    });
    row.append(name, rm);
    wl.appendChild(row);
  }
}

function bindPrivacy(): void {
  $<HTMLInputElement>("#blocker-enabled").addEventListener("change", (e) => {
    settings.blocker.enabled = (e.target as HTMLInputElement).checked;
    scheduleSave();
  });

  $("#add-list").addEventListener("click", () => {
    const name = $<HTMLInputElement>("#new-list-name").value.trim();
    const url = $<HTMLInputElement>("#new-list-url").value.trim();
    if (!name || !url.startsWith("http")) return;
    settings.blocker.lists.push({
      id: `list-${Date.now()}`,
      name,
      url,
      enabled: true,
      bundled: false,
      ruleCount: 0,
      lastUpdated: 0,
    });
    $<HTMLInputElement>("#new-list-name").value = "";
    $<HTMLInputElement>("#new-list-url").value = "";
    renderLists();
    scheduleSave();
  });

  $("#add-whitelist").addEventListener("click", () => {
    const host = $<HTMLInputElement>("#new-whitelist-host").value.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!host || settings.blocker.whitelist.includes(host)) return;
    settings.blocker.whitelist.push(host);
    $<HTMLInputElement>("#new-whitelist-host").value = "";
    renderLists();
    scheduleSave();
  });
}

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

function bindPerformance(): void {
  document.querySelectorAll<HTMLInputElement>(`input[name="profile"]`).forEach((r) =>
    r.addEventListener("change", () => {
      const id = r.value as "eco" | "balanced" | "performance" | "custom";
      settings.performance.profile = id;
      if (id !== "custom" && PROFILE_PRESETS[id]) {
        Object.assign(settings.performance, PROFILE_PRESETS[id]);
        fillPerformanceFields();
      }
      $("#custom-profile-card").style.display = id === "custom" ? "" : "none";
      scheduleSave();
    })
  );

  const pc = $<HTMLInputElement>("#process-count");
  pc.addEventListener("input", () => {
    settings.performance.processCount = +pc.value;
    settings.performance.profile = "custom";
    checkProfileRadio();
    $("#process-count-out").textContent = pc.value;
    scheduleSave();
  });
  const dc = $<HTMLInputElement>("#disk-cache");
  dc.addEventListener("input", () => {
    settings.performance.diskCacheMb = +dc.value;
    settings.performance.profile = "custom";
    checkProfileRadio();
    $("#disk-cache-out").textContent = dc.value;
    scheduleSave();
  });
  $<HTMLInputElement>("#hw-video").addEventListener("change", (e) => {
    settings.performance.hwVideoDecode = (e.target as HTMLInputElement).checked;
    settings.performance.profile = "custom";
    checkProfileRadio();
    scheduleSave();
  });
  $<HTMLInputElement>("#webrender").addEventListener("change", (e) => {
    settings.performance.webRender = (e.target as HTMLInputElement).checked;
    settings.performance.profile = "custom";
    checkProfileRadio();
    scheduleSave();
  });

  $("#copy-userjs").addEventListener("click", async () => {
    await navigator.clipboard.writeText(profileToUserJs(settings.performance));
    const btn = $<HTMLButtonElement>("#copy-userjs");
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "Copy user.js snippet"), 1500);
  });
}

function checkProfileRadio(): void {
  document.querySelectorAll<HTMLInputElement>(`input[name="profile"]`).forEach((r) => {
    r.checked = r.value === settings.performance.profile;
  });
  $("#custom-profile-card").style.display = settings.performance.profile === "custom" ? "" : "none";
}

function fillPerformanceFields(): void {
  $<HTMLInputElement>("#process-count").value = String(settings.performance.processCount);
  $("#process-count-out").textContent = String(settings.performance.processCount);
  $<HTMLInputElement>("#disk-cache").value = String(settings.performance.diskCacheMb);
  $("#disk-cache-out").textContent = String(settings.performance.diskCacheMb);
  $<HTMLInputElement>("#hw-video").checked = settings.performance.hwVideoDecode;
  $<HTMLInputElement>("#webrender").checked = settings.performance.webRender;
  checkProfileRadio();
}

// ---------------------------------------------------------------------------
// Shortcuts (read-only listing; rebinding lives in about:addons)
// ---------------------------------------------------------------------------

async function renderShortcuts(): Promise<void> {
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

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

function fillFields(): void {
  const { theme, sidebar, blocker, general } = settings;

  document.querySelectorAll<HTMLInputElement>(`input[name="mode"]`).forEach((r) => {
    r.checked = r.value === theme.mode;
  });
  $<HTMLInputElement>("#accent-hue").value = String(theme.accentHue);
  $("#accent-hue-out").textContent = `${theme.accentHue}°`;
  $<HTMLInputElement>("#accent-sat").value = String(theme.accentSaturation);
  $("#accent-sat-out").textContent = `${theme.accentSaturation}%`;
  $<HTMLInputElement>("#blur").value = String(theme.blurIntensity);
  $("#blur-out").textContent = `${theme.blurIntensity}px`;
  $<HTMLInputElement>("#grain").value = String(theme.grainOpacity);
  $("#grain-out").textContent = `${theme.grainOpacity}%`;
  document.querySelectorAll<HTMLInputElement>(`input[name="preset"]`).forEach((r) => {
    r.checked = r.value === theme.backgroundPreset;
  });
  $<HTMLInputElement>("#custom-newtab").checked = general.customNewTab;

  $<HTMLSelectElement>("#provider-select").value = sidebar.providerId;
  $<HTMLInputElement>("#model-input").value = sidebar.model;
  $<HTMLInputElement>("#ollama-url").value = sidebar.ollamaUrl;
  $<HTMLInputElement>("#key-groq").value = sidebar.apiKeyGroq;
  $<HTMLInputElement>("#key-openai").value = sidebar.apiKeyOpenai;
  $<HTMLInputElement>("#key-xai").value = sidebar.apiKeyXai;
  $<HTMLInputElement>("#include-context").checked = sidebar.includePageContext;

  $<HTMLInputElement>("#blocker-enabled").checked = blocker.enabled;
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
