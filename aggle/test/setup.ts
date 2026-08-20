// Global test setup — mock the Firefox extension API before every test.
import { beforeEach } from "vitest";

const mockStorage: Record<string, unknown> = {};

const mockBrowser = {
  storage: {
    local: {
      get: async (key?: string) => {
        if (key) return { [key]: mockStorage[key] };
        return { ...mockStorage };
      },
      set: async (obj: Record<string, unknown>) => {
        Object.assign(mockStorage, obj);
      },
      clear: async () => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      },
    },
    sync: {
      get: async () => ({}),
      set: async () => {},
      clear: async () => {},
    },
    onChanged: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
  tabs: {
    query: async () => [],
    update: async () => ({}),
    reload: async () => ({}),
    create: async () => ({ id: 1, url: "", title: "" }),
    get: async () => ({ id: 1, url: "", title: "" }),
    onUpdated: { addListener: () => {}, removeListener: () => {} },
    onActivated: { addListener: () => {}, removeListener: () => {} },
    onRemoved: { addListener: () => {}, removeListener: () => {} },
    executeScript: async () => [],
    sendMessage: async () => undefined,
  },
  windows: {
    create: async () => ({ id: 1 }),
    query: async () => [],
    onRemoved: { addListener: () => {}, removeListener: () => {} },
  },
  runtime: {
    getURL: (path: string) => `chrome-extension://test-id/${path}`,
    sendMessage: async () => undefined,
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    },
    id: "test-extension-id",
  },
  commands: {
    onCommand: { addListener: () => {}, removeListener: () => {} },
    getAll: async () => [],
  },
  sidebarAction: {
    toggle: async () => {},
    open: async () => {},
    close: async () => {},
    onOpened: { addListener: () => {}, removeListener: () => {} },
    onClosed: { addListener: () => {}, removeListener: () => {} },
  },
  webRequest: {
    onBeforeRequest: {
      addListener: () => {},
      removeListener: () => {},
    },
  },
  privacy: {
    network: {
      webRTCIPHandlingPolicy: { set: async () => {} },
      networkPredictionEnabled: { set: async () => {} },
    },
  },
};

// Assign the mock before any module loads
(globalThis as Record<string, unknown>).browser = mockBrowser;

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

export {};
