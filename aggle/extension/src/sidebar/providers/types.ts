// Provider plugin format — a provider is pure data. Drop a JSON file with
// this shape into the mods registry (storage key "aggle-providers") and it
// appears in the sidebar with no core-code change.

export interface ProviderDefinition {
  id: string;
  name: string;
  baseUrl: string;
  chatPath: string; // appended to baseUrl for chat completions
  modelsPath?: string; // appended to baseUrl to list models
  authScheme: "bearer" | "none";
  needsApiKey: boolean;
  models: string[];
  extraHeaders?: Record<string, string>;
  // Request body mapping: top-level fields merged into the OpenAI-style payload.
  extraBody?: Record<string, unknown>;
}

export interface ChatRequest {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  stream: true;
}

// All built-in providers speak the OpenAI-compatible SSE dialect:
// data: {"choices":[{"delta":{"content":"…"}}]}
// so one streaming client serves every provider.
