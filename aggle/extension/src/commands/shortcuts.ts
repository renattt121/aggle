import { toggleBlocker } from "../blocker/ui";
import { getSettings } from "../utils/storage";

// Custom keyboard shortcut handlers — these supplement the manifest-level
// shortcuts. The manifest declares the keybindings; this file wires them to
// extension behaviour.

// Toggle ad blocker for the current tab/site.
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
