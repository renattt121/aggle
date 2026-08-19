import { DEFAULT_SETTINGS, STORAGE_KEY } from "./constants";
import type { AggleSettings } from "../types";

// Deep-merge stored settings over defaults so adding new keys in an update
// keeps working with data written by older versions.
function merge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (typeof base !== "object" || Array.isArray(base) || typeof patch !== "object" || Array.isArray(patch)) {
    return patch as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    out[k] = k in (base as Record<string, unknown>) ? merge((base as Record<string, unknown>)[k], v) : v;
  }
  return out as T;
}

export async function getSettings(): Promise<AggleSettings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return merge(DEFAULT_SETTINGS, stored[STORAGE_KEY]);
}

export async function saveSettings(settings: AggleSettings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
}

export async function updateSettings(patch: Partial<AggleSettings>): Promise<AggleSettings> {
  const current = await getSettings();
  const next = merge(current, patch);
  await saveSettings(next);
  return next;
}

// Generic helpers for feature-scoped keys (conversations, filter caches, …)
export async function getItem<T>(key: string, fallback: T): Promise<T> {
  const stored = await browser.storage.local.get(key);
  return (stored[key] as T) ?? fallback;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await browser.storage.local.set({ [key]: value });
}

export function onSettingsChanged(callback: (settings: AggleSettings) => void): void {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue as AggleSettings);
    }
  });
}
