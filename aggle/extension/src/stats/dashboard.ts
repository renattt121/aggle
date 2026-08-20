import { getSettings, getItem, setItem } from "../utils/storage";
import { PROFILE_PRESETS } from "../utils/constants";
import type { AggleSettings, BlockerStats } from "../types";

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

let settings: AggleSettings;

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

document.querySelectorAll<HTMLElement>(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll<HTMLElement>(".nav-item").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll<HTMLElement>(".tab").forEach((t) => t.classList.remove("active"));
    btn.classList.add("active");
    $(`#tab-${btn.dataset.tab}`).classList.add("active");
    void loadTabData();
  });
});

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

async function loadOverview(): Promise<void> {
  const stats = await getItem<BlockerStats>("aggle-blocker-stats", {
    totalBlocked: 0,
    blockedToday: 0,
    lastResetDate: "",
    perSite: {},
  });
  const tabs = await browser.tabs.query({});
  $("#stat-total").textContent = stats.totalBlocked.toLocaleString();
  $("#stat-today").textContent = stats.blockedToday.toLocaleString();
  $("#stat-tabs").textContent = String(tabs.length);
  $("#stat-active").textContent = String(tabs.filter((t) => !t.discarded).length);
  $("#stat-profile").textContent = settings.performance.profile;
  $("#stat-cache").textContent = `${settings.performance.diskCacheMb} MB`;
}

// ---------------------------------------------------------------------------
// Tab list
// ---------------------------------------------------------------------------

async function loadTabList(): Promise<void> {
  const tabs = await browser.tabs.query({});
  const wrap = $("#tab-list");
  wrap.innerHTML = "";
  for (const tab of tabs) {
    const row = document.createElement("div");
    row.className = "tab-row";
    const dot = document.createElement("span");
    dot.className = `dot ${tab.discarded ? "disc" : "on"}`;
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = tab.title ?? "Untitled";
    const url = document.createElement("span");
    url.className = "url";
    url.textContent = tab.url ?? "";
    const reload = document.createElement("button");
    reload.className = "reload-btn";
    reload.textContent = "Reload";
    reload.addEventListener("click", () => {
      if (tab.id !== undefined) browser.tabs.reload(tab.id, { bypassCache: true });
    });
    row.append(dot, name, url, reload);
    wrap.appendChild(row);
  }
}

async function loadTabData(): Promise<void> {
  await loadOverview();
  await loadTabList();
  syncPerformanceControls();
}

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

function syncPerformanceControls(): void {
  const p = settings.performance;
  document.querySelectorAll<HTMLInputElement>(`input[name="profile"]`).forEach((r) => {
    r.checked = r.value === p.profile;
  });
  $<HTMLInputElement>("#profile-proc").value = String(p.processCount);
  $("#profile-proc-out").textContent = String(p.processCount);
  $<HTMLInputElement>("#profile-cache").value = String(p.diskCacheMb);
  $("#profile-cache-out").textContent = `${p.diskCacheMb} MB`;
  $<HTMLInputElement>("#profile-hw").checked = p.hwVideoDecode;
  $<HTMLInputElement>("#profile-webgl").checked = p.webRender;
}

function bindPerformance(): void {
  document.querySelectorAll<HTMLInputElement>(`input[name="profile"]`).forEach((r) =>
    r.addEventListener("change", () => {
      const id = r.value as "eco" | "balanced" | "performance" | "custom";
      settings.performance.profile = id;
      if (id !== "custom" && PROFILE_PRESETS[id]) {
        Object.assign(settings.performance, PROFILE_PRESETS[id]);
        syncPerformanceControls();
      }
      void saveSettings();
    })
  );

  $<HTMLInputElement>("#profile-proc").addEventListener("input", (e) => {
    const el = e.currentTarget as HTMLInputElement;
    settings.performance.processCount = +el.value;
    settings.performance.profile = "custom";
    $("#profile-proc-out").textContent = el.value;
    void saveSettings();
  });
  $<HTMLInputElement>("#profile-cache").addEventListener("input", (e) => {
    const el = e.currentTarget as HTMLInputElement;
    settings.performance.diskCacheMb = +el.value;
    settings.performance.profile = "custom";
    $("#profile-cache-out").textContent = `${el.value} MB`;
    void saveSettings();
  });
  $<HTMLInputElement>("#profile-hw").addEventListener("change", () => {
    settings.performance.hwVideoDecode = $<HTMLInputElement>("#profile-hw").checked;
    settings.performance.profile = "custom";
    void saveSettings();
  });
  $<HTMLInputElement>("#profile-webgl").addEventListener("change", () => {
    settings.performance.webRender = $<HTMLInputElement>("#profile-webgl").checked;
    settings.performance.profile = "custom";
    void saveSettings();
  });
}

async function saveSettings(): Promise<void> {
  await browser.storage.local.set({ "aggle-settings": settings });
  void loadOverview();
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

(async () => {
  settings = await getSettings();
  syncPerformanceControls();
  bindPerformance();
  await loadTabData();
})();
