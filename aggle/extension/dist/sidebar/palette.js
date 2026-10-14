"use strict";
(() => {
  if (window.__agglePaletteInitialized) return;
  window.__agglePaletteInitialized = true;

  const COMMANDS = [
    { id: "youtube", label: "Go to YouTube", icon: "▶️", run: () => { window.location.href = "https://youtube.com"; } },
    { id: "reddit", label: "Go to Reddit", icon: "👽", run: () => { window.location.href = "https://reddit.com"; } },
    { id: "github", label: "Go to GitHub", icon: "🐙", run: () => { window.location.href = "https://github.com"; } },
    { id: "recommended", label: "Show Recommended", icon: "⭐", run: () => { alert("Recommended: Try the AI Sidebar, check Aggle Stats, or explore the Privacy Settings!"); } },
    { id: "theme", label: "Change the Look (Dark/Light)", icon: "🎨", run: () => {
      document.documentElement.style.colorScheme = (document.documentElement.style.colorScheme === "light") ? "dark" : "light";
    } },
    { id: "stats", label: "Open Aggle Stats", icon: "📊", run: () => { browser.runtime.sendMessage({ action: "openTab", url: "aggle:stats" }); } },
    { id: "ai", label: "Toggle AI Web Panel", icon: "🤖", run: () => { browser.runtime.sendMessage({ action: "toggleSidebar" }); } },
    { id: "blocker-toggle", label: "Toggle Ad Blocker for This Site", icon: "🛡️", run: () => { browser.runtime.sendMessage({ action: "toggleBlocker" }); } },
    { id: "settings", label: "Open Settings", icon: "⚙️", run: () => { browser.runtime.sendMessage({ action: "openTab", url: "aggle:settings" }); } },
    { id: "newtab", label: "New Tab", icon: "➕", run: () => { browser.runtime.sendMessage({ action: "openTab" }); } },
    { id: "new-private", label: "New Private Window", icon: "🔒", run: () => { browser.runtime.sendMessage({ action: "newPrivateWindow" }); } }
  ];

  let isOpen = false;
  let filteredList = COMMANDS;
  let activeIndex = 0;
  let holdTimer = null;

  function ensurePaletteDOM() {
    if (document.getElementById("aggle-palette")) return;
    const target = document.body || document.documentElement;
    if (!target) return;

    const el = document.createElement("div");
    el.id = "aggle-palette";
    el.innerHTML = `
      <div id="palette-backdrop" class="palette-backdrop"></div>
      <div class="palette">
        <div class="palette-header">
          <span class="palette-icon">⌘</span>
          <input id="palette-input" type="text" placeholder="What do you want to do?" autocomplete="off" spellcheck="false">
        </div>
        <div id="palette-list" class="palette-list"></div>
      </div>`;
    target.appendChild(el);

    const input = el.querySelector("#palette-input");
    if (input) {
      input.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        filteredList = COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
        activeIndex = 0;
        renderList();
      });
    }

    const backdrop = el.querySelector("#palette-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closePalette);
    }
  }

  function renderList() {
    const listEl = document.querySelector("#palette-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    if (filteredList.length === 0) {
      listEl.innerHTML = '<div class="empty">No matching commands</div>';
      activeIndex = 0;
      return;
    }
    activeIndex = Math.max(0, Math.min(activeIndex, filteredList.length - 1));
    for (let i = 0; i < filteredList.length; i++) {
      const item = filteredList[i];
      const btn = document.createElement("button");
      btn.className = `row${i === activeIndex ? " focused" : ""}`;
      btn.innerHTML = `<span class="row-icon">${item.icon}</span><span class="row-label">${item.label}</span>`;
      btn.addEventListener("click", () => execCommand(item));
      listEl.appendChild(btn);
    }
    const focusedEl = listEl.querySelector(".focused");
    if (focusedEl) focusedEl.scrollIntoView({ block: "nearest" });
  }

  function execCommand(cmd) {
    closePalette();
    try {
      cmd.run();
    } catch (err) {
      console.error("Aggle palette command error:", err);
    }
  }

  function openPalette() {
    if (isOpen) return;
    isOpen = true;
    filteredList = COMMANDS;
    activeIndex = 0;

    ensurePaletteDOM();

    const paletteEl = document.querySelector("#aggle-palette");
    const inputEl = document.querySelector("#palette-input");

    if (inputEl) inputEl.value = "";
    document.body.classList.add("palette-open");
    if (paletteEl) paletteEl.style.display = "block";

    renderList();
    setTimeout(() => {
      const inp = document.querySelector("#palette-input");
      if (inp) inp.focus();
    }, 20);
  }

  function closePalette() {
    if (!isOpen) return;
    isOpen = false;
    document.body.classList.remove("palette-open");
    const paletteEl = document.querySelector("#aggle-palette");
    if (paletteEl) paletteEl.style.display = "none";
  }

  function isModifier(e) {
    return (
      e.key === "Meta" ||
      e.key === "OS" ||
      e.code === "MetaLeft" ||
      e.code === "MetaRight" ||
      e.key === "Control" ||
      e.code === "ControlLeft" ||
      e.code === "ControlRight"
    );
  }

  function setup() {
    ensurePaletteDOM();

    document.addEventListener("keydown", (e) => {
      // 1. Shortcut: Cmd+K or Ctrl+K (supports any keyboard layout)
      const isK = e.key === "k" || e.key === "K" || e.code === "KeyK";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        e.stopPropagation();
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        if (isOpen) {
          closePalette();
        } else {
          openPalette();
        }
        return;
      }

      // 2. Palette navigation while open
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          activeIndex = Math.min(activeIndex + 1, filteredList.length - 1);
          renderList();
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          activeIndex = Math.max(activeIndex - 1, 0);
          renderList();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          if (filteredList[activeIndex]) {
            execCommand(filteredList[activeIndex]);
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          closePalette();
          return;
        }
        return;
      }

      // 3. Hold Command/Control to pop out palette (~350ms)
      if (isModifier(e)) {
        if (!holdTimer && !e.repeat) {
          holdTimer = window.setTimeout(() => {
            holdTimer = null;
            openPalette();
          }, 350);
        }
      } else {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      }
    }, true);

    document.addEventListener("keyup", (e) => {
      if (isModifier(e)) {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      }
    }, true);

    window.addEventListener("blur", () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    });

    browser.runtime?.onMessage?.addListener((msg) => {
      if (msg?.action === "palette:open") {
        openPalette();
        return Promise.resolve({ ok: true });
      }
      if (msg?.action === "palette:close") {
        closePalette();
        return Promise.resolve({ ok: true });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
})();
