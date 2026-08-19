import { getSettings } from "../utils/storage";
import { blockerEngine } from "./engine";

const BADGE_COLORS = { off: "#52525B", on: "#FF5A1F" };

export async function refreshBadge(): Promise<void> {
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

export async function toggleBlocker(on: boolean): Promise<void> {
  const s = await getSettings();
  await browser.storage.local.set({
    "aggle-settings": {
      ...s,
      blocker: { ...s.blocker, enabled: on },
    },
  });
  if (on) await blockerEngine.rebuildRules();
  void refreshBadge();
}

export async function toggleSite(hostname: string, whitelisted: boolean): Promise<void> {
  const s = await getSettings();
  const wl = [...s.blocker.whitelist];
  if (whitelisted) {
    if (!wl.includes(hostname)) wl.push(hostname);
  } else {
    const idx = wl.indexOf(hostname);
    if (idx >= 0) wl.splice(idx, 1);
  }
  await browser.storage.local.set({
    "aggle-settings": {
      ...s,
      blocker: { ...s.blocker, whitelist: wl },
    },
  });
  await blockerEngine.rebuildRules();
}
