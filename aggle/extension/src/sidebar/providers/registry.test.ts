import { describe, it, expect, vi, beforeEach } from "vitest";

describe("provider registry", () => {
  let registry: typeof import("./registry");

  beforeEach(async () => {
    vi.clearAllMocks();
    registry = await import("./registry");
  });

  it("getAllProviders returns built-in providers", async () => {
    const providers = await registry.getAllProviders();
    expect(providers).toHaveLength(4); // ollama, groq, openai, xai
    const ids = providers.map((p) => p.id);
    expect(ids).toContain("ollama");
    expect(ids).toContain("groq");
    expect(ids).toContain("openai");
    expect(ids).toContain("xai");
  });

  it("getProvider finds a provider by id", async () => {
    const provider = await registry.getProvider("groq");
    expect(provider).toBeDefined();
    expect(provider!.id).toBe("groq");
    expect(provider!.name).toBe("Groq");
  });

  it("getProvider returns undefined for unknown id", async () => {
    const provider = await registry.getProvider("nonexistent");
    expect(provider).toBeUndefined();
  });

  it("apiKeyFor returns correct key per provider", async () => {
    const settings = { apiKeyGroq: "gsk_test", apiKeyOpenai: "sk_test", apiKeyXai: "xai_test" };

    const groqProvider = await registry.getProvider("groq");
    expect(registry.apiKeyFor(groqProvider!, settings)).toBe("gsk_test");

    const openaiProvider = await registry.getProvider("openai");
    expect(registry.apiKeyFor(openaiProvider!, settings)).toBe("sk_test");

    const xaiProvider = await registry.getProvider("xai");
    expect(registry.apiKeyFor(xaiProvider!, settings)).toBe("xai_test");

    const ollamaProvider = await registry.getProvider("ollama");
    expect(registry.apiKeyFor(ollamaProvider!, settings)).toBe("");
  });

  it("ollama provider has no API key requirement", async () => {
    const ollama = await registry.getProvider("ollama");
    expect(ollama!.needsApiKey).toBe(false);
    expect(ollama!.authScheme).toBe("none");
  });

  it("groq provider requires API key", async () => {
    const groq = await registry.getProvider("groq");
    expect(groq!.needsApiKey).toBe(true);
    expect(groq!.authScheme).toBe("bearer");
  });

  it("built-in providers have models listed", async () => {
    const groq = await registry.getProvider("groq");
    expect(groq!.models.length).toBeGreaterThan(0);
    expect(groq!.models).toContain("llama-3.1-8b-instant");
  });
});
