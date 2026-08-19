import type { ProviderDefinition } from "./types";
import { getItem } from "../../utils/storage";

// Built-in providers (all OpenAI-compatible chat-completions dialects).
export const BUILTIN_PROVIDERS: ProviderDefinition[] = [
  {
    id: "ollama",
    name: "Ollama (local)",
    baseUrl: "http://localhost:11434",
    chatPath: "/v1/chat/completions",
    modelsPath: "/v1/models",
    authScheme: "none",
    needsApiKey: false,
    models: ["llama3.1", "llama3.2", "qwen2.5", "mistral", "gemma2"],
    extraBody: { stream: true },
  },
  {
    id: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai",
    chatPath: "/v1/chat/completions",
    modelsPath: "/v1/models",
    authScheme: "bearer",
    needsApiKey: true,
    models: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
  },
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com",
    chatPath: "/v1/chat/completions",
    modelsPath: "/v1/models",
    authScheme: "bearer",
    needsApiKey: true,
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "o4-mini"],
  },
  {
    id: "xai",
    name: "xAI",
    baseUrl: "https://api.x.ai",
    chatPath: "/v1/chat/completions",
    modelsPath: "/v1/models",
    authScheme: "bearer",
    needsApiKey: true,
    models: ["grok-3", "grok-3-mini", "grok-2-1212"],
  },
];

export async function getAllProviders(): Promise<ProviderDefinition[]> {
  const custom = await getItem<ProviderDefinition[]>("aggle-providers", []);
  const valid = custom.filter(
    (p) => p && typeof p.id === "string" && typeof p.baseUrl === "string" && !BUILTIN_PROVIDERS.some((b) => b.id === p.id)
  );
  return [...BUILTIN_PROVIDERS, ...valid];
}

export async function getProvider(id: string): Promise<ProviderDefinition | undefined> {
  const all = await getAllProviders();
  return all.find((p) => p.id === id);
}

export function apiKeyFor(provider: ProviderDefinition, settings: { apiKeyGroq: string; apiKeyOpenai: string; apiKeyXai: string }): string {
  switch (provider.id) {
    case "groq": return settings.apiKeyGroq;
    case "openai": return settings.apiKeyOpenai;
    case "xai": return settings.apiKeyXai;
    default: return "";
  }
}
