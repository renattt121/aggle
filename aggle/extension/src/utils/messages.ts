import type { PageContext } from "../types";

// Typed message protocol between UI pages (sidebar/options/stats), the
// background script, and content scripts. Discriminated on `action`.

export type AggleMessage =
  // Blocker
  | { action: "blocker:getState" }
  | { action: "blocker:toggle", enabled: boolean }
  | { action: "blocker:toggleSite", hostname: string; whitelisted: boolean }
  | { action: "blocker:getStats" }
  // Page context
  | { action: "content:extractPage" }
  | { action: "content:extractPageResult"; context: PageContext }
  // Tabs / stats
  | { action: "stats:getTabInfo" }
  | { action: "stats:unloadTab"; tabId: number }
  // Sidebar
  | { action: "sidebar:opened" }
  // Command palette
  | { action: "palette:open" };

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  hostname: string;
  discarded: boolean;
  blockedCount: number;
}

export interface StatsSnapshot {
  tabCount: number;
  tabs: TabInfo[];
  totalBlocked: number;
  blockedToday: number;
  profile: string;
}

export function sendMessage(msg: AggleMessage): Promise<unknown> {
  return browser.runtime.sendMessage(msg);
}
