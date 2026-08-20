import { describe, it, expect, vi, beforeEach } from "vitest";

describe("buildRequest", () => {
  let client: typeof import("./client");

  beforeEach(async () => {
    client = await import("./client");
  });

  it("builds correct URL for provider", () => {
    const provider = {
      id: "test",
      name: "Test",
      baseUrl: "https://api.example.com",
      chatPath: "/v1/chat/completions",
      authScheme: "bearer" as const,
      needsApiKey: true,
      models: [],
    };
    const { url } = client.buildRequest(provider, "sk_test", []);
    expect(url).toBe("https://api.example.com/v1/chat/completions");
  });

  it("trims trailing slash from baseUrl", () => {
    const provider = {
      id: "test",
      name: "Test",
      baseUrl: "https://api.example.com/",
      chatPath: "/v1/chat/completions",
      authScheme: "bearer" as const,
      needsApiKey: true,
      models: [],
    };
    const { url } = client.buildRequest(provider, "", []);
    expect(url).toBe("https://api.example.com/v1/chat/completions");
  });

  it("includes Authorization header for bearer auth", () => {
    const provider = {
      id: "test",
      name: "Test",
      baseUrl: "https://api.example.com",
      chatPath: "/v1/chat/completions",
      authScheme: "bearer" as const,
      needsApiKey: true,
      models: [],
    };
    const { init } = client.buildRequest(provider, "sk_mykey", []);
    const headers = JSON.parse(init.body as string) as unknown;
    // Check headers from the request init
    const request = client.buildRequest(provider, "sk_mykey", []);
    expect((request.init.headers as Record<string, string>)["Authorization"]).toBe("Bearer sk_mykey");
  });

  it("omits Authorization for no-auth providers", () => {
    const provider = {
      id: "ollama",
      name: "Ollama",
      baseUrl: "http://localhost:11434",
      chatPath: "/v1/chat/completions",
      authScheme: "none" as const,
      needsApiKey: false,
      models: [],
    };
    const request = client.buildRequest(provider, "", []);
    const headers = request.init.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("includes Content-Type header", () => {
    const provider = {
      id: "test",
      name: "Test",
      baseUrl: "https://api.example.com",
      chatPath: "/v1/chat/completions",
      authScheme: "none" as const,
      needsApiKey: false,
      models: [],
    };
    const request = client.buildRequest(provider, "", []);
    const headers = request.init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sets POST method", () => {
    const provider = {
      id: "test",
      name: "Test",
      baseUrl: "https://api.example.com",
      chatPath: "/v1/chat/completions",
      authScheme: "none" as const,
      needsApiKey: false,
      models: [],
    };
    const { init } = client.buildRequest(provider, "", []);
    expect(init.method).toBe("POST");
  });

  it("includes extraBody fields", () => {
    const provider = {
      id: "ollama",
      name: "Ollama",
      baseUrl: "http://localhost:11434",
      chatPath: "/v1/chat/completions",
      authScheme: "none" as const,
      needsApiKey: false,
      models: [],
      extraBody: { stream: true, options: { temperature: 0.7 } },
    };
    const request = client.buildRequest(provider, "", []);
    const body = JSON.parse(request.init.body as string) as Record<string, unknown>;
    expect(body.stream).toBe(true);
    expect(body.options).toEqual({ temperature: 0.7 });
  });
});
