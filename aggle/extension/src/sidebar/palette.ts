// Command palette — floating searchable overlay for quick actions.

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

const ACTIONS: { id: string; label: string; icon: string; run: () => void | Promise<void> }[] = [
  {
    id: "stats",
    label: "Open Aggle Stats",
    icon: "📊",
    run: () => {
      browser.tabs.create({ url: "src/stats/dashboard.html", active: true });
    },
  },
  {
    id: "ai",
    label: "Toggle AI Sidebar",
    icon: "🤖",
    run: () => browser.sidebarAction?.toggle(),
  },
  {
    id: "blocker-toggle",
    label: "Toggle Ad Blocker for This Site",
    icon: "🛡️",
    run: () => {
      // Dispatch via content script
      browser.tabs?.query?.({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab?.id) {
          browser.tabs.sendMessage(tab.id, { action: "blocker:toggle-site" });
        }
      });
    },
  },
  {
    id: "settings",
    label: "Open Settings",
    icon: "⚙️",
    run: () => browser.tabs.create({ url: "src/options/options.html" }),
  },
  {
    id: "newtab",
    label: "New Tab",
    icon: "➕",
    run: () => browser.tabs.create({ active: true }),
  },
  {
    id: "new-private",
    label: "New Private Window",
    icon: "🔒",
    run: () => browser.windows.create({ incognito: true }),
  },
];

let isOpen = false;
let filtered = ACTIONS;
let focusedIdx = 0;

function render(): void {
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

function runAction(a: (typeof ACTIONS)[0]): void {
  closePalette();
  a.run();
}

function openPalette(): void {
  isOpen = true;
  filtered = ACTIONS;
  focusedIdx = 0;
  const input = $("#palette-input") as HTMLInputElement;
  input.value = "";
  document.body.classList.add("aggle-palette-open");
  render();
  setTimeout(() => $("#palette-input").focus(), 10);
}

function closePalette(): void {
  isOpen = false;
  document.body.classList.remove("aggle-palette-open");
}

function bind(): void {
  $("#palette-input").addEventListener("input", (e) => {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
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

(function init() {
  const div = document.createElement("div");
  div.id = "aggle-palette";
  div.innerHTML = `
    <div id="palette-backdrop" class="palette-backdrop"></div>
    <div class="palette">
      <div class="palette-header">
        <span class="palette-icon">⌘</span>
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
    return undefined;
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")) {
      if (location.protocol.startsWith("http")) {
        e.preventDefault();
        openPalette();
      }
    }
  });
})();

export {}; // Ensure it's treated as a module
