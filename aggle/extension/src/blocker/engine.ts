import { getSettings } from "../utils/storage";
import { parseFilterList } from "./parser";
import { BUNDLED_FILTERS } from "./lists";
import type { BlockerStats } from "./types";

let activeRules: RegExp[] = [];
let whitelist: string[] = [];
let enabled = true;
let totalBlocked = 0;
let blockedToday = 0;
let lastResetDate = "";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadState(): Promise<void> {
  const s = await getSettings();
  enabled = s.blocker.enabled;
  whitelist = s.blocker.whitelist;
  totalBlocked = s.blocker.stats.totalBlocked;
  blockedToday = s.blocker.stats.blockedToday;
  lastResetDate = s.blocker.stats.lastResetDate;
  activeRules = [];
}

function resetIfNeeded(): void {
  const dt = today();
  if (lastResetDate !== dt) {
    blockedToday = 0;
    lastResetDate = dt;
  }
}

async function rebuildRules(): Promise<void> {
  const s = await getSettings();
  const pool: RegExp[] = [];

  for (const f of parseFilterList(BUNDLED_FILTERS)) {
    if (f.regex) pool.push(f.regex);
  }

    for (const list of s.blocker.lists) {
    if (!list.enabled) continue;
    const rules = (list as unknown as { rules: { regex?: RegExp }[] }).rules;
    for (const f of rules) {
      if (f.regex) pool.push(f.regex);
    }
  }

  activeRules = pool;
}

function matchesAny(url: string): boolean {
  for (const re of activeRules) {
    if (re.test(url)) return true;
  }
  return false;
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!enabled) return undefined;
    resetIfNeeded();

    const url = details.url;
    const hostname = (new URL(url).hostname ?? "").replace(/^www\./, "");
    if (whitelist.includes(hostname)) return undefined;

    if (matchesAny(url)) {
      totalBlocked++;
      blockedToday++;
      const newStats: BlockerStats = {
        totalBlocked,
        blockedToday,
        lastResetDate,
        perSite: {},
      };
      // Save stats via storage
      browser.storage.local.set({ "aggle-blocker-stats": newStats });
      return { cancel: true };
    }
    return undefined;
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

export const blockerEngine = {
  loadState,
  rebuildRules,
  getStats: (): { enabled: boolean; totalBlocked: number; blockedToday: number } => ({
    enabled,
    totalBlocked,
    blockedToday,
  }),
};
