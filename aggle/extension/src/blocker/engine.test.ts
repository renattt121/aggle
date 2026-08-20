import { describe, it, expect, vi, beforeEach } from "vitest";

describe("blocker engine", () => {
  let getSettingsMock: ReturnType<typeof vi.fn>;
  let storageGetMock: ReturnType<typeof vi.fn>;
  let storageSetMock: ReturnType<typeof vi.fn>;
  let engine: typeof import("./engine").blockerEngine;

  beforeEach(async () => {
    vi.clearAllMocks();
    getSettingsMock = vi.fn();
    storageGetMock = vi.fn().mockResolvedValue({});
    storageSetMock = vi.fn().mockResolvedValue(undefined);

    (globalThis as Record<string, unknown>).browser = {
      webRequest: { onBeforeRequest: { addListener: vi.fn(), removeListener: vi.fn() } },
      storage: {
        local: { get: storageGetMock, set: storageSetMock },
        onChanged: { addListener: vi.fn() },
      },
    } as unknown as typeof browser;

    // Mock storage.get to return settings
    storageGetMock.mockImplementation(async (key: string) => {
      if (key === "aggle-settings") {
        return { "aggle-settings": getSettingsMock() };
      }
      return {};
    });

    const mod = await import("./engine");
    engine = mod.blockerEngine;
  });

  it("loadState reads settings correctly", async () => {
    getSettingsMock.mockReturnValueOnce({
      blocker: {
        enabled: false,
        whitelist: ["example.com"],
        lists: [],
        stats: { totalBlocked: 5, blockedToday: 2, lastResetDate: "2025-01-01", perSite: {} },
      },
    });

    await engine.loadState();
    const stats = engine.getStats();
    expect(stats.enabled).toBe(false);
    expect(stats.totalBlocked).toBe(5);
    expect(stats.blockedToday).toBe(2);
  });

  it("getStats returns current state", async () => {
    await engine.loadState();
    const stats = engine.getStats();
    expect(stats).toHaveProperty("enabled");
    expect(stats).toHaveProperty("totalBlocked");
    expect(stats).toHaveProperty("blockedToday");
  });

  it("rebuildRules compiles filter lists", async () => {
    getSettingsMock.mockReturnValueOnce({
      blocker: {
        enabled: true,
        whitelist: [],
        lists: [
          {
            id: "test-list",
            name: "Test List",
            url: "test",
            enabled: true,
            bundled: true,
            rules: [
              { id: "r1", type: "network" as const, pattern: "||test-ad.com^", regex: /^https?:\/\/.*test-ad\.com/i, domain: undefined, isException: false },
            ],
            lastUpdated: 0,
          },
        ],
        stats: { totalBlocked: 0, blockedToday: 0, lastResetDate: "", perSite: {} },
      },
    });

    await engine.rebuildRules();
    // Engine should not throw
    expect(engine.getStats()).toBeTruthy();
  });
});
