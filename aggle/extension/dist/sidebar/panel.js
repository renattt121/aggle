"use strict";
(() => {
  const SERVICES = {
    gemini: {
      name: "Google Gemini",
      url: "https://gemini.google.com",
      loginUrl: "https://accounts.google.com/ServiceLogin?service=bard&continue=https%3A%2F%2Fgemini.google.com%2F"
    },
    duckai: {
      name: "DuckDuckGo AI (duck.ai)",
      url: "https://duck.ai",
      loginUrl: "https://duck.ai"
    },
    chatgpt: {
      name: "ChatGPT",
      url: "https://chatgpt.com",
      loginUrl: "https://chatgpt.com/auth/login"
    },
    claude: {
      name: "Claude",
      url: "https://claude.ai",
      loginUrl: "https://claude.ai/login"
    },
    perplexity: {
      name: "Perplexity",
      url: "https://www.perplexity.ai",
      loginUrl: "https://www.perplexity.ai"
    }
  };

  const DEFAULT_SERVICE = "gemini";
  const DEFAULT_CUSTOM_URL = "https://gemini.google.com";

  // Elements
  const serviceSelect = document.getElementById("service-select");
  const webFrame = document.getElementById("web-frame");
  const btnLogin = document.getElementById("btn-login");
  const btnReload = document.getElementById("btn-reload");
  const btnOpenTab = document.getElementById("btn-open-tab");
  const btnSettings = document.getElementById("btn-settings");
  const btnTellPage = document.getElementById("btn-tell-page");
  const toast = document.getElementById("toast");

  const customBanner = document.getElementById("custom-url-banner");
  const customUrlInput = document.getElementById("custom-url-input");
  const customUrlSave = document.getElementById("custom-url-save");
  const customUrlCancel = document.getElementById("custom-url-cancel");

  let currentService = localStorage.getItem("aggle-panel-service") || DEFAULT_SERVICE;
  let customUrl = localStorage.getItem("aggle-panel-custom-url") || DEFAULT_CUSTOM_URL;
  let toastTimer = null;

  function getCurrentUrl() {
    if (currentService === "custom") {
      return customUrl || DEFAULT_CUSTOM_URL;
    }
    return SERVICES[currentService]?.url || SERVICES.gemini.url;
  }

  function loadService(serviceKey) {
    currentService = serviceKey;
    localStorage.setItem("aggle-panel-service", currentService);
    serviceSelect.value = currentService;

    if (currentService === "custom") {
      customUrlInput.value = customUrl;
      customBanner.hidden = false;
      webFrame.src = customUrl;
    } else {
      customBanner.hidden = true;
      const targetUrl = SERVICES[currentService]?.url || SERVICES.gemini.url;
      if (webFrame.src !== targetUrl) {
        webFrame.src = targetUrl;
      }
    }
  }

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => {
      toast.hidden = true;
      toastTimer = null;
    }, 3200);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        return false;
      }
    }
  }

  async function handleTellMeAboutPage() {
    try {
      const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!activeTab) {
        showToast("⚠️ No active tab found");
        return;
      }

      let pageData = null;
      if (activeTab.id !== undefined) {
        try {
          pageData = await browser.tabs.sendMessage(activeTab.id, { action: "content:extractPage" });
        } catch {
          // If content script was not ready or on a restricted page
        }
      }

      const title = pageData?.title || activeTab.title || "Current Page";
      const url = pageData?.url || activeTab.url || "";
      const text = pageData?.text || "";

      let prompt = `Please summarize and explain what this page is about:\n\nTitle: ${title}\nURL: ${url}`;
      if (text) {
        const cleanText = text.length > 4500 ? `${text.slice(0, 4500)}\n\n[... content truncated]` : text;
        prompt += `\n\nPage Content:\n${cleanText}`;
      }

      const success = await copyToClipboard(prompt);
      if (success) {
        showToast("✓ Page context copied! Paste into chat (⌘V)");
      } else {
        showToast("⚠️ Could not copy to clipboard");
      }
    } catch (err) {
      console.error("Error extracting page context:", err);
      showToast("⚠️ Error reading page context");
    }
  }

  // Event Listeners
  serviceSelect.addEventListener("change", (e) => {
    loadService(e.target.value);
  });

  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      const service = SERVICES[currentService];
      const loginUrl = service?.loginUrl || getCurrentUrl();
      browser.tabs.create({ url: loginUrl, active: true });
      showToast("Opened sign-in tab. Return here once signed in!");
    });
  }

  btnReload.addEventListener("click", () => {
    const target = getCurrentUrl();
    webFrame.src = "about:blank";
    setTimeout(() => { webFrame.src = target; }, 50);
  });

  btnOpenTab.addEventListener("click", () => {
    const url = getCurrentUrl();
    browser.tabs.create({ url, active: true });
  });

  btnSettings.addEventListener("click", () => {
    customBanner.hidden = !customBanner.hidden;
    if (!customBanner.hidden) {
      customUrlInput.value = customUrl;
      customUrlInput.focus();
    }
  });

  customUrlSave.addEventListener("click", () => {
    let entered = customUrlInput.value.trim();
    if (!entered) return;
    if (!/^https?:\/\//i.test(entered)) {
      entered = `https://${entered}`;
    }
    customUrl = entered;
    localStorage.setItem("aggle-panel-custom-url", customUrl);
    customBanner.hidden = true;
    currentService = "custom";
    loadService("custom");
  });

  customUrlCancel.addEventListener("click", () => {
    customBanner.hidden = true;
  });

  btnTellPage.addEventListener("click", handleTellMeAboutPage);

  // Auto-refresh when returning to window after logging in
  window.addEventListener("focus", () => {
    try {
      if (webFrame.src.includes("accounts.google.com") || webFrame.src.includes("auth")) {
        webFrame.src = getCurrentUrl();
      }
    } catch {}
  });

  browser.runtime?.onMessage?.addListener((msg) => {
    if (msg?.action === "panel:reloadService") {
      webFrame.src = getCurrentUrl();
      showToast("✓ Synced with active session!");
    }
  });

  // Initialize
  loadService(currentService);
})();