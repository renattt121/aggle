// Custom new tab page — liquid glass address bar + all controls wired

const q = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;

// ── Search engines ──
const ENGINES: Record<string, { icon: string; search: (q: string) => string }> = {
  duckduckgo: { icon: "🦆", search: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  google:     { icon: "G",   search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  bing:       { icon: "B",   search: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
};

function getDefaultLinks(): { label: string; url: string }[] {
  return [
    { label: "GitHub",    url: "https://github.com" },
    { label: "YouTube",   url: "https://youtube.com" },
    { label: "Reddit",    url: "https://reddit.com" },
    { label: "Aggle Stats", url: "src/stats/dashboard.html" },
    { label: "Settings",  url: "src/options/options.html" },
  ];
}

function renderLinks(): void {
  const wrap = q<HTMLDivElement>("#quick-links");
  wrap.innerHTML = "";
  const links = JSON.parse(localStorage.getItem("aggle-quick-links") ?? JSON.stringify(getDefaultLinks())) as { label: string; url: string }[];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const a = document.createElement("a");
    a.className = "link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = link.label;

    // Double-click to edit URL
    a.addEventListener("dblclick", (e) => {
      e.preventDefault();
      editLink(i, links, wrap);
    });

    // Right-click to remove
    a.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      links.splice(i, 1);
      localStorage.setItem("aggle-quick-links", JSON.stringify(links));
      renderLinks();
    });

    wrap.appendChild(a);
  }
}

function editLink(index: number, links: { label: string; url: string }[], wrap: HTMLElement): void {
  const existing = wrap.children[index] as HTMLElement;
  const current = links[index];

  const labelSpan = document.createElement("span");
  labelSpan.style.cssText = "font-size:11px;color:var(--muted);margin-right:6px;display:block;";
  labelSpan.textContent = current.label;

  const input = document.createElement("input");
  input.className = "link-edit-input";
  input.value = current.url;
  input.placeholder = "https://…";

  existing.innerHTML = "";
  existing.appendChild(labelSpan);
  existing.appendChild(input);
  input.focus();
  input.select();

  const finish = () => {
    const val = input.value.trim();
    if (val) links[index].url = val;
    localStorage.setItem("aggle-quick-links", JSON.stringify(links));
    renderLinks();
  };

  input.addEventListener("blur", finish);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish();
    if (e.key === "Escape") renderLinks();
  });
}

function setGreeting(): void {
  const h = new Date().getHours();
  const greet = h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  q<HTMLParagraphElement>("#greeting").textContent = greet;
}

function updateTime(): void {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const mins = now.getMinutes().toString().padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  q<HTMLDivElement>("#clock-time").textContent = `${h}:${mins} ${ampm}`;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  q<HTMLDivElement>("#clock-date").textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

function navigate(url: string): void {
  browser.tabs.update({ url });
}

function doSearch(query: string): void {
  const engineId = (window as unknown as { _aggleEngine?: string })._aggleEngine || "duckduckgo";
  const engine = ENGINES[engineId] || ENGINES.duckduckgo;
  navigate(engine.search(query));
}

function isProbablyUrl(input: string): boolean {
  if (!input) return false;
  if (/^https?:\/\//i.test(input)) return true;
  if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}/.test(input)) return true;
  if (/^localhost(?::\d+)?\/?$/.test(input)) return true;
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?$/.test(input)) return true;
  return false;
}

// ── Address bar ──
function bindAddressBar(): void {
  const input = q<HTMLInputElement>("#address-input");
  const icon = q<HTMLSpanElement>("#address-icon");
  const engineBtn = q<HTMLButtonElement>("#engine-btn");
  const engineDD = q<HTMLDivElement>("#engine-dd");
  const engineIcon = q<HTMLSpanElement>("#engine-icon");

  let engineOpen = false;

  function updateEngineIcon(): void {
    const engineId = (window as unknown as { _aggleEngine?: string })._aggleEngine || "duckduckgo";
    engineIcon.textContent = (ENGINES[engineId] || ENGINES.duckduckgo).icon;
  }

  function updateUrlBar(url?: string): void {
    if (url) {
      input.value = url;
      if (url.startsWith("https://")) icon.textContent = "🔒";
      else if (url.startsWith("http://")) icon.textContent = "⚠️";
      else if (url.startsWith("about:")) icon.textContent = "ℹ️";
      else icon.textContent = "🔍";
    }
  }

  // Reflect current tab URL in the address bar
  browser.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
    if (tab.url && tab.status === "complete") {
      browser.tabs.query({ active: true, currentWindow: true }).then(([activeTab]) => {
        if (activeTab?.id === tab.id) updateUrlBar(tab.url);
      });
    }
  });

  browser.tabs.onActivated.addListener(({ tabId }) => {
    browser.tabs.get(tabId).then((tab) => updateUrlBar(tab.url));
  });

  // Submit: navigate or search
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      if (isProbablyUrl(val)) {
        navigate(val.startsWith("http") ? val : `https://${val}`);
      } else {
        doSearch(val);
      }
      input.blur();
    }
  });

  input.addEventListener("focus", () => {
    input.select();
  });

  // Engine dropdown
  engineBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    engineOpen = !engineOpen;
    engineDD.hidden = !engineOpen;
    engineDD.classList.toggle("open", engineOpen);
  });

  document.addEventListener("click", (e) => {
    if (engineOpen && !engineDD.contains(e.target as Node) && e.target !== engineBtn) {
      engineOpen = false;
      engineDD.hidden = true;
      engineDD.classList.remove("open");
    }
  });

  engineDD.querySelectorAll<HTMLButtonElement>(".engine-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const engineId = btn.dataset.engine;
      if (engineId) {
        (window as unknown as { _aggleEngine?: string })._aggleEngine = engineId;
        localStorage.setItem("aggle-search-engine", engineId);
        updateEngineIcon();
      }
      engineOpen = false;
      engineDD.hidden = true;
      engineDD.classList.remove("open");
    });
  });

  // Restore saved engine
  const saved = localStorage.getItem("aggle-search-engine");
  if (saved && saved in ENGINES) {
    (window as unknown as { _aggleEngine?: string })._aggleEngine = saved;
  }
  updateEngineIcon();
}

// ── Nav buttons (back / forward / reload) ──
function bindNavButtons(): void {
  const back = q<HTMLButtonElement>("#btn-back");
  const fwd = q<HTMLButtonElement>("#btn-fwd");
  const reload = q<HTMLButtonElement>("#btn-reload");

  reload.addEventListener("click", () => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id !== undefined) browser.tabs.reload(tab.id, { bypassCache: true });
    });
  });

  let history: string[] = [];
  let historyIndex = -1;

  browser.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
    if (tab.url) {
      if (history[historyIndex] !== tab.url) {
        history = history.slice(0, historyIndex + 1);
        history.push(tab.url);
        historyIndex = history.length - 1;
      }
      back.disabled = historyIndex <= 0;
      fwd.disabled = historyIndex >= history.length - 1;
    }
  });

  back.addEventListener("click", () => {
    if (historyIndex > 0) { historyIndex--; navigate(history[historyIndex]); }
  });
  fwd.addEventListener("click", () => {
    if (historyIndex < history.length - 1) { historyIndex++; navigate(history[historyIndex]); }
  });
}

// ── Action buttons ──
function bindActionButtons(): void {
  const btnStats = q<HTMLButtonElement>("#btn-stats");
  const btnPalette = q<HTMLButtonElement>("#btn-palette");

  btnStats.addEventListener("click", () => {
    browser.tabs.create({ url: "src/stats/dashboard.html", active: true });
  });

  btnPalette.addEventListener("click", () => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.id !== undefined) {
        browser.tabs.sendMessage(tab.id, { action: "palette:open" }).catch(() => {
          browser.tabs.create({ url: "about:blank", active: true }).then((newTab) => {
            if (newTab?.id !== undefined) {
              setTimeout(() => {
                browser.tabs.sendMessage(newTab.id!, { action: "palette:open" }).catch(() => {});
              }, 300);
            }
          });
        });
      }
    });
  });
}

(async () => {
  setGreeting();
  updateTime();
  setInterval(updateTime, 1e3);
  renderLinks();
  bindAddressBar();
  bindNavButtons();
  bindActionButtons();
})();
