// Aggle shared type definitions — used by background, sidebar, options, stats, and content scripts.

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export type ThemeMode = "dark" | "oled";

export interface ThemeConfig {
  mode: ThemeMode;
  accentHue: number; // 0-360, base hue for the accent gradient
  accentSaturation: number; // 0-100
  blurIntensity: number; // 0-40 px of backdrop blur
  grainOpacity: number; // 0-100, noise texture strength
  backgroundPreset: BackgroundPresetId;
}

export type BackgroundPresetId = "ember" | "frost" | "void";

export interface BackgroundPreset {
  id: BackgroundPresetId;
  label: string;
  from: string;
  to: string;
}

// ---------------------------------------------------------------------------
// AI sidebar
// ---------------------------------------------------------------------------

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export type SidebarMode = "chat" | "summarize" | "translate";

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  needsApiKey: boolean;
}

// ---------------------------------------------------------------------------
// Ad blocker
// ---------------------------------------------------------------------------

export interface FilterList {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  bundled: boolean;
  ruleCount: number;
  lastUpdated: number;
}

export interface BlockerStats {
  totalBlocked: number;
  blockedToday: number;
  lastResetDate: string; // ISO date (YYYY-MM-DD)
  perSite: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Resource profiles
// ---------------------------------------------------------------------------

export type ResourceProfileId = "eco" | "balanced" | "performance" | "custom";

export interface ResourceProfileSettings {
  profile: ResourceProfileId;
  processCount: number; // dom.ipc.processCount
  diskCacheMb: number; // browser.cache.disk.capacity, MB
  hwVideoDecode: boolean;
  webRender: boolean;
}

// ---------------------------------------------------------------------------
// Page context (content script → sidebar)
// ---------------------------------------------------------------------------

export interface PageContext {
  url: string;
  title: string;
  text: string; // extracted main text, truncated
  excerpt: string;
}

// ---------------------------------------------------------------------------
// Root settings object persisted in browser.storage.local
// ---------------------------------------------------------------------------

export interface AggleSettings {
  theme: ThemeConfig;
  sidebar: {
    providerId: string;
    model: string;
    apiKeyGroq: string;
    apiKeyOpenai: string;
    apiKeyXai: string;
    ollamaUrl: string;
    includePageContext: boolean;
  };
  blocker: {
    enabled: boolean;
    lists: FilterList[];
    whitelist: string[]; // hostnames where blocking is off
    stats: BlockerStats;
  };
  performance: ResourceProfileSettings;
  general: {
    customNewTab: boolean;
    commandPaletteEnabled: boolean;
    searchEngine: "duckduckgo" | "google" | "bing";
  };
}
