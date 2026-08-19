"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };

  // extension/src/sidebar/palette.ts
  var palette_exports = {};
  function render() {
    const list = $("#palette-list");
    list.innerHTML = "";
    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty">No matching commands</div>`;
      focusedIdx = 0;
      return;
    }
    focusedIdx = Math.min(focusedIdx, filtered.length - 1);
    for (let i = 0; i < filtered.length; i++) {
      const a = filtered[i];
      const row = document.createElement("button");
      row.className = `row${i === focusedIdx ? " focused" : ""}`;
      row.innerHTML = `<span class="row-icon">${a.icon}</span><span class="row-label">${a.label}</span>`;
      row.addEventListener("click", () => runAction(a));
      list.appendChild(row);
    }
  }
  function runAction(a) {
    closePalette();
    a.run();
  }
  function openPalette() {
    isOpen = true;
    filtered = ACTIONS;
    focusedIdx = 0;
    const input = $("#palette-input");
    input.value = "";
    document.body.classList.add("aggle-palette-open");
    render();
    setTimeout(() => $("#palette-input").focus(), 10);
  }
  function closePalette() {
    isOpen = false;
    document.body.classList.remove("aggle-palette-open");
  }
  function bind() {
    $("#palette-input").addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      filtered = ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
      focusedIdx = 0;
      render();
    });
    document.addEventListener("keydown", (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusedIdx = Math.min(focusedIdx + 1, filtered.length - 1);
        render();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusedIdx = Math.max(focusedIdx - 1, 0);
        render();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[focusedIdx]) runAction(filtered[focusedIdx]);
      } else if (e.key === "Escape") {
        closePalette();
      }
    });
    document.getElementById("palette-backdrop")?.addEventListener("click", closePalette);
  }
  var $, ACTIONS, isOpen, filtered, focusedIdx;
  var init_palette = __esm({
    "extension/src/sidebar/palette.ts"() {
      "use strict";
      $ = (sel) => document.querySelector(sel);
      ACTIONS = [
        {
          id: "stats",
          label: "Open Aggle Stats",
          icon: "\u{1F4CA}",
          run: () => {
            browser.tabs.create({ url: "src/stats/dashboard.html", active: true });
          }
        },
        {
          id: "ai",
          label: "Toggle AI Sidebar",
          icon: "\u{1F916}",
          run: () => browser.sidebarAction?.toggle()
        },
        {
          id: "blocker-toggle",
          label: "Toggle Ad Blocker for This Site",
          icon: "\u{1F6E1}\uFE0F",
          run: () => {
            browser.tabs?.query?.({ active: true, currentWindow: true }).then(([tab]) => {
              if (tab?.id) {
                browser.tabs.sendMessage(tab.id, { action: "blocker:toggle-site" });
              }
            });
          }
        },
        {
          id: "settings",
          label: "Open Settings",
          icon: "\u2699\uFE0F",
          run: () => browser.tabs.create({ url: "src/options/options.html" })
        },
        {
          id: "newtab",
          label: "New Tab",
          icon: "\u2795",
          run: () => browser.tabs.create({ active: true })
        },
        {
          id: "new-private",
          label: "New Private Window",
          icon: "\u{1F512}",
          run: () => browser.windows.create({ incognito: true })
        }
      ];
      isOpen = false;
      filtered = ACTIONS;
      focusedIdx = 0;
      (function init() {
        const div = document.createElement("div");
        div.id = "aggle-palette";
        div.innerHTML = `
    <div id="palette-backdrop" class="palette-backdrop"></div>
    <div class="palette">
      <div class="palette-header">
        <span class="palette-icon">\u2318</span>
        <input id="palette-input" type="text" placeholder="What do you want to do?" autocomplete="off">
      </div>
      <div id="palette-list" class="palette-list"></div>
    </div>`;
        document.body.appendChild(div);
        bind();
        browser.runtime?.onMessage.addListener((msg) => {
          if (msg?.action === "palette:open") {
            openPalette();
            return true;
          }
          if (msg?.action === "palette:close") {
            closePalette();
            return true;
          }
          return void 0;
        });
        document.addEventListener("keydown", (e) => {
          if (e.ctrlKey && e.key === "k" || e.metaKey && e.key === "k") {
            if (location.protocol.startsWith("http")) {
              e.preventDefault();
              openPalette();
            }
          }
        });
      })();
    }
  });

  // extension/src/content.ts
  var paletteLink = document.createElement("link");
  paletteLink.rel = "stylesheet";
  paletteLink.href = browser.runtime.getURL("/dist/palette.css");
  document.head.appendChild(paletteLink);
  Promise.resolve().then(() => init_palette());
  function extractPage() {
    const strip = (root) => {
      root.querySelectorAll("script, style, noscript, svg, nav, footer, header, aside, form, iframe").forEach((el) => el.remove());
      return root;
    };
    let host = document.querySelector("article") ?? document.querySelector("main") ?? document.querySelector("[role=main]") ?? null;
    let text = "";
    if (host) {
      text = strip(host.cloneNode(true)).innerText ?? "";
    }
    if (text.replace(/\s+/g, " ").trim().length < 280 && document.body) {
      text = strip(document.body.cloneNode(true)).innerText ?? "";
    }
    const normalized = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
    const truncated = normalized.length > 12e3 ? `${normalized.slice(0, 12e3)}

[... truncated]` : normalized;
    return {
      url: location.href,
      title: document.title,
      text: truncated,
      excerpt: normalized.slice(0, 220)
    };
  }
  if (!window.__aggleContentLoaded) {
    window.__aggleContentLoaded = true;
    browser.runtime.onMessage.addListener((msg) => {
      if (msg?.action === "content:extractPage") {
        return Promise.resolve(extractPage());
      }
      return void 0;
    });
  }
})();
//# sourceMappingURL=content.js.map
