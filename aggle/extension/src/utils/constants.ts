import type { AggleSettings, BackgroundPreset } from "../types";

// Brand tokens
export const BRAND = {
  black: "#0A0A0A",
  oled: "#000000",
  accentFrom: "#FF5A1F",
  accentTo: "#FF8A3D",
  frostFrom: "#5EA0FF",
  frostTo: "#E8F1FF",
} as const;

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: "ember", label: "Ember", from: "#FF5A1F", to: "#FF8A3D" },
  { id: "frost", label: "Frost", from: "#5EA0FF", to: "#E8F1FF" },
  { id: "void", label: "Void", from: "#1A1A1E", to: "#0A0A0A" },
];

export const DEFAULT_SETTINGS: AggleSettings = {
  theme: {
    mode: "dark",
    accentHue: 18, // ember orange
    accentSaturation: 100,
    blurIntensity: 24,
    grainOpacity: 15,
    backgroundPreset: "ember",
  },
  sidebar: {
    providerId: "ollama",
    model: "llama3.1",
    apiKeyGroq: "",
    apiKeyOpenai: "",
    apiKeyXai: "",
    ollamaUrl: "http://localhost:11434",
    includePageContext: true,
  },
  blocker: {
    enabled: true,
    lists: [
      {
        id: "aggle-builtin",
        name: "Aggle Base List",
        url: "bundled:base",
        enabled: true,
        bundled: true,
        ruleCount: 0,
        lastUpdated: 0,
      },
    ],
    whitelist: [],
    stats: {
      totalBlocked: 0,
      blockedToday: 0,
      lastResetDate: "",
      perSite: {},
    },
  },
  performance: {
    profile: "balanced",
    processCount: 8,
    diskCacheMb: 512,
    hwVideoDecode: true,
    webRender: true,
  },
  general: {
    customNewTab: true,
    commandPaletteEnabled: true,
  },
};

// Resource profile presets — "custom" keeps whatever the user set.
export const PROFILE_PRESETS: Record<string, Partial<AggleSettings["performance"]>> = {
  eco: { processCount: 4, diskCacheMb: 256, hwVideoDecode: false, webRender: true },
  balanced: { processCount: 8, diskCacheMb: 512, hwVideoDecode: true, webRender: true },
  performance: { processCount: 12, diskCacheMb: 2048, hwVideoDecode: true, webRender: true },
};

export const STORAGE_KEY = "aggle-settings";
