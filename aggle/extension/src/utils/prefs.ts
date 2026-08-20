import type { ResourceProfileSettings } from "../types";

// Aggle exposes only a slice of prefs to WebExtensions via browser.privacy
// (network/tracking protection, webRTC IP handling, etc.). Process count and
// cache capacity can't be set from an extension — for the Path A build we
// record the user's choice and generate a user.js snippet the policies layer
// can apply; when Path B (source fork) lands, these become native writes.

export async function applyPrivacyDefaults(): Promise<void> {
  const network = browser.privacy.network;
  await network.webRTCIPHandlingPolicy.set({ value: "default_public_interface_only" });
  await network.networkPredictionEnabled.set({ value: false });
}

export function profileToUserJs(perf: ResourceProfileSettings): string {
  const cacheBytes = perf.diskCacheMb * 1024;
  return [
    "// Aggle resource profile (drop into <profile>/user.js or Aggle.overrides.cfg)",
    `user_pref("dom.ipc.processCount", ${perf.processCount});`,
    `user_pref("browser.cache.disk.capacity", ${cacheBytes});`,
    `user_pref("browser.cache.disk.enable", ${perf.diskCacheMb > 0 ? "true" : "false"});`,
    `user_pref("media.hardware-video-decoding.enabled", ${perf.hwVideoDecode});`,
    `user_pref("gfx.webrender.all", ${perf.webRender});`,
  ].join("\n");
}
