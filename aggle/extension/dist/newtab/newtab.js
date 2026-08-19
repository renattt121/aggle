"use strict";
(() => {
  // extension/src/newtab/newtab.ts
  var q = (sel) => document.querySelector(sel);
  function updateTime() {
    const now = /* @__PURE__ */ new Date();
    const hours = now.getHours();
    const mins = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    q("#clock-time").textContent = `${h}:${mins} ${ampm}`;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    q("#clock-date").textContent = dateStr;
  }
  function getDefaultLinks() {
    return [
      { label: "GitHub", url: "https://github.com" },
      { label: "Google", url: "https://google.com" },
      { label: "YouTube", url: "https://youtube.com" },
      { label: "Reddit", url: "https://reddit.com" },
      { label: "Aggle", url: "about:addons" }
    ];
  }
  function renderLinks() {
    const wrap = q("#quick-links");
    wrap.innerHTML = "";
    const links = JSON.parse(localStorage.getItem("aggle-quick-links") ?? JSON.stringify(getDefaultLinks()));
    for (const link of links) {
      const a = document.createElement("a");
      a.className = "link";
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = link.label;
      wrap.appendChild(a);
    }
  }
  function setGreeting() {
    const h = (/* @__PURE__ */ new Date()).getHours();
    const greet = h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    q("#greeting").textContent = greet;
  }
  function bindSearch() {
    const form = q("#search-form");
    const input = q("#search-input");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      browser.tabs.create({ url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}` });
    });
  }
  (async () => {
    setGreeting();
    updateTime();
    setInterval(updateTime, 1e4);
    renderLinks();
    bindSearch();
  })();
})();
//# sourceMappingURL=newtab.js.map
