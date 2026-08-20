import { blockerEngine } from "./blocker/engine";
import { refreshBadge } from "./blocker/ui";
import type { AggleMessage } from "./utils/messages";
import type { TabInfo } from "./utils/messages";

// ---------------------------------------------------------------------------
// Command routing
// ---------------------------------------------------------------------------

browser.commands.onCommand.addListener(async (command) => {
  if (command === "open-stats") {
    await browser.tabs.create({ url: "src/stats/dashboard.html", active: true });
  }
});

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

(async () => {
  await blockerEngine.loadState();
  await blockerEngine.rebuildRules();
  void refreshBadge();
})();

// ---------------------------------------------------------------------------
// Message routing
// ---------------------------------------------------------------------------

browser.runtime.onMessage.addListener((msg: AggleMessage, _sender) => {
  switch (msg.action) {
    case "blocker:getState": {
      const stats = blockerEngine.getStats();
      return Promise.resolve({ ...stats, totalBlocked: stats.totalBlocked });
    }
    case "blocker:toggle":
      void blockerEngine.rebuildRules();
      void refreshBadge();
      return Promise.resolve({ ok: true });
    case "blocker:getStats":
      return Promise.resolve(blockerEngine.getStats());
    case "stats:getTabInfo":
      return browser.tabs.query({}).then((tabs) => {
        const out: TabInfo[] = tabs.map((t) => ({
          id: t.id!,
          title: t.title ?? "",
          url: t.url ?? "",
          hostname: (() => { try { return new URL(t.url ?? "").hostname; } catch { return ""; } })(),
          discarded: t.discarded ?? false,
          blockedCount: 0,
        }));
        return Promise.resolve({ tabCount: out.length, tabs: out });
      });
    case "stats:unloadTab":
      return browser.tabs.reload(msg.tabId, { bypassCache: true });
    case "sidebar:opened":
      return Promise.resolve({ ok: true });
  }
  return undefined;
});

// ---------------------------------------------------------------------------
// Tabs — refresh badge on navigation so blocked count stays current
// ---------------------------------------------------------------------------

browser.tabs.onUpdated.addListener(() => {
  void refreshBadge();
});

browser.tabs.onActivated.addListener(() => {
  void refreshBadge();
});
