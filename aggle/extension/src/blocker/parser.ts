import type { Filter, FilterType } from "./types";

// Lightweight ABP-compatible network filter parser. Covers the most common
// syntaxes: domain-prefixed, double-bar, wildcard, regex, exception rules.
// Cosmetic filters are ignored — we only block network requests.

let idCounter = 0;

function toRegex(pattern: string, isException: boolean): RegExp | null {
  // Strip leading/trailing modifiers that don't affect the match.
  // Modifiers like $third-party, $important, $match-case can appear after ^ or at end.
  const clean = pattern
    .replace(/\$[a-zA-Z][a-zA-Z0-9_-]*(?:=[^$]*)?/g, "")
    .trim();

  // Double-bar prefix (||) — hostname-anchored.
  if (clean.startsWith("||")) {
    let host = clean.slice(2).replace(/[*^?]/g, "");
    host = host.replace(/\/$/, "");
    const re = new RegExp(`(?:^https?://(?:.*\\.)?${host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`);
    return isException ? null : re;
  }

  // Single-bar prefix (|) — left-anchored substring match.
  if (clean.startsWith("|")) {
    const substr = clean.slice(1).replace(/[*^?]/g, "");
    if (!isException) return new RegExp(substr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return null;
  }

  // Wildcard — convert to a regex.
  if (clean.includes("*")) {
    // Escape everything except * first, then replace escaped asterisks with .*
    const esc = clean.replace(/[*]/g, "\x00").replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\x00/g, ".*");
    const re = new RegExp("^" + esc + "$", "i");
    return isException ? null : re;
  }

  // Exact match — anchor to avoid substring matches, but allow URL prefixes.
  const exact = clean.replace(/[^a-zA-Z0-9._-]/g, "\\$&");
  if (!isException) return new RegExp("(?:^|[^a-zA-Z0-9._-])" + exact + "(?:$|[^a-zA-Z0-9._-])", "i");
  return null;
}

export function parseRule(line: string): Filter | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("[")) return null;

  const isException = trimmed.startsWith("@@");
  const pattern = isException ? trimmed.slice(2).trim() : trimmed;
  const regex = toRegex(pattern, false);

  let domain: string | undefined;
  const dm = /^\\|\\|([^/^*]+)\^?\$/.exec(trimmed);
  if (dm) domain = dm[1];

  return {
    id: `f-${++idCounter}`,
    type: "network",
    pattern,
    regex: regex!,
    domain,
    isException,
  };
}

export function parseFilterList(text: string): Filter[] {
  return text.split("\n").map(parseRule).filter(Boolean) as Filter[];
}
