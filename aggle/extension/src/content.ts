import type { PageContext } from "./types";

// Inject the command palette CSS into every web page.
const paletteLink = document.createElement("link");
paletteLink.rel = "stylesheet";
paletteLink.href = browser.runtime.getURL("/dist/palette.css");
document.head.appendChild(paletteLink);

// Inject the command palette JS into every web page.
import("./sidebar/palette");

// ---------------------------------------------------------------------------
// Page context extractor — called on demand by the AI sidebar
// ---------------------------------------------------------------------------

function extractPage(): PageContext {
  const strip = (root: HTMLElement) => {
    root.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form, iframe").forEach((el) => el.remove());
    return root;
  };

  let host: HTMLElement | null =
    document.querySelector<HTMLElement>("article") ??
    document.querySelector<HTMLElement>("main") ??
    document.querySelector<HTMLElement>("[role=main]") ??
    null;

  let text = "";
  if (host) {
    text = strip(host.cloneNode(true) as HTMLElement).innerText ?? "";
  }
  if (text.replace(/\s+/g, " ").trim().length < 280 && document.body) {
    text = strip(document.body.cloneNode(true) as HTMLElement).innerText ?? "";
  }

  const normalized = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
  const truncated = normalized.length > 12000 ? `${normalized.slice(0, 12000)}\n\n[... truncated]` : normalized;

  return {
    url: location.href,
    title: document.title,
    text: truncated,
    excerpt: normalized.slice(0, 220),
  };
}

declare global {
  interface Window { __aggleContentLoaded?: boolean }
}

if (!window.__aggleContentLoaded) {
  window.__aggleContentLoaded = true;
  browser.runtime.onMessage.addListener((msg: { action?: string }) => {
    if (msg?.action === "content:extractPage") {
      return Promise.resolve(extractPage());
    }
    return undefined;
  });
}
