import type { ProviderDefinition, ChatRequest } from "./providers/types";

// One streaming client for every provider: they all speak the OpenAI SSE
// dialect (data: {"choices":[{"delta":{"content":…}}]}).

export interface StreamHandlers {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

export function buildRequest(
  provider: ProviderDefinition,
  apiKey: string,
  messages: ChatRequest["messages"]
): { url: string; init: RequestInit } {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(provider.extraHeaders ?? {}),
  };
  if (provider.authScheme === "bearer" && apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const body: Record<string, unknown> = { model: "", messages, stream: true, ...(provider.extraBody ?? {}) };
  return {
    url: `${provider.baseUrl.replace(/\/$/, "")}${provider.chatPath}`,
    init: { method: "POST", headers, body: JSON.stringify(body) },
  };
}

export async function streamChat(
  provider: ProviderDefinition,
  apiKey: string,
  model: string,
  messages: ChatRequest["messages"],
  handlers: StreamHandlers
): Promise<void> {
  const { url, init } = buildRequest(provider, apiKey, messages);
  const body = JSON.parse(init.body as string) as Record<string, unknown>;
  body.model = model;
  init.body = JSON.stringify(body);

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (e) {
    handlers.onError(
      provider.id === "ollama"
        ? `Can't reach Ollama at ${provider.baseUrl}. Is it running? (ollama serve)`
        : `Network error reaching ${provider.name}: ${(e as Error).message}`
    );
    return;
  }

  if (!response.ok || !response.body) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const j = await response.json();
      detail = j?.error?.message ?? detail;
    } catch { /* keep status text */ }
    handlers.onError(`${provider.name}: ${detail}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let anyToken = false;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const json = JSON.parse(payload);
          const token: string = json?.choices?.[0]?.delta?.content ?? "";
          if (token) {
            anyToken = true;
            handlers.onToken(token);
          }
        } catch { /* skip malformed SSE line */ }
      }
    }
    if (!anyToken) handlers.onError("The model returned an empty response.");
    else handlers.onDone();
  } catch (e) {
    if (anyToken) handlers.onDone();
    else handlers.onError(`Stream failed: ${(e as Error).message}`);
  }
}

export async function listModels(provider: ProviderDefinition, apiKey: string): Promise<string[]> {
  if (!provider.modelsPath) return provider.models;
  const headers: Record<string, string> = {};
  if (provider.authScheme === "bearer" && apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  try {
    const res = await fetch(`${provider.baseUrl.replace(/\/$/, "")}${provider.modelsPath}`, { headers });
    if (!res.ok) return provider.models;
    const json = await res.json();
    const remote: string[] = (json?.data ?? []).map((m: { id: string }) => m.id).filter(Boolean);
    return remote.length ? remote : provider.models;
  } catch {
    return provider.models;
  }
}
