"use strict";
(() => {
  var c = (e) => document.querySelector(e),
    p = {
      duckduckgo: {
        name: "DuckDuckGo",
        icon: "\u{1F986}",
        search: (e) => `https://duckduckgo.com/?q=${encodeURIComponent(e)}`,
      },
      google: {
        name: "Google",
        icon: "\u{1F50D}",
        search: (e) =>
          `https://www.google.com/search?q=${encodeURIComponent(e)}`,
      },
      bing: {
        name: "Bing",
        icon: "B",
        search: (e) => `https://www.bing.com/search?q=${encodeURIComponent(e)}`,
      },
      brave: {
        name: "Brave Search",
        icon: "\u{1F981}",
        search: (e) =>
          `https://search.brave.com/search?q=${encodeURIComponent(e)}`,
      },
      startpage: {
        name: "Startpage",
        icon: "\u{1F575}\uFE0F",
        search: (e) =>
          `https://www.startpage.com/do/search?query=${encodeURIComponent(e)}`,
      },
      ecosia: {
        name: "Ecosia",
        icon: "\u{1F333}",
        search: (e) =>
          `https://www.ecosia.org/search?q=${encodeURIComponent(e)}`,
      },
      kagi: {
        name: "Kagi",
        icon: "\u{1F415}",
        search: (e) => `https://kagi.com/search?q=${encodeURIComponent(e)}`,
      },
      youtube: {
        name: "YouTube",
        icon: "\u25B6\uFE0F",
        search: (e) =>
          `https://www.youtube.com/results?search_query=${encodeURIComponent(e)}`,
      },
    };
  function v() {
    return [
      { label: "GitHub", url: "https://github.com" },
      { label: "YouTube", url: "https://youtube.com" },
      { label: "Reddit", url: "https://reddit.com" },
      { label: "Aggle Stats", url: "aggle:stats" },
      { label: "Settings", url: "aggle:settings" },
    ];
  }
  function h() {
    let e = c("#quick-links");
    e.innerHTML = "";
    let s = JSON.parse(
      localStorage.getItem("aggle-quick-links") ?? JSON.stringify(v()),
    );
    for (let a = 0; a < s.length; a++) {
      let t = s[a],
        n = document.createElement("a");
      ((n.className = "link"),
        (n.href = t.url),
        (n.target = "_self"),
        (n.rel = "noopener"),
        (n.textContent = t.label),
        n.addEventListener("dblclick", (i) => {
          (i.preventDefault(), k(a, s, e));
        }),
        n.addEventListener("contextmenu", (i) => {
          (i.preventDefault(),
            s.splice(a, 1),
            localStorage.setItem("aggle-quick-links", JSON.stringify(s)),
            h());
        }),
        e.appendChild(n));
    }
  }
  function k(e, s, a) {
    let t = a.children[e],
      n = s[e],
      i = document.createElement("span");
    ((i.style.cssText =
      "font-size:11px;color:var(--muted);margin-right:6px;display:block;"),
      (i.textContent = n.label));
    let l = document.createElement("input");
    ((l.className = "link-edit-input"),
      (l.value = n.url),
      (l.placeholder = "https://\u2026"),
      (t.innerHTML = ""),
      t.appendChild(i),
      t.appendChild(l),
      l.focus(),
      l.select());
    let d = () => {
      let u = l.value.trim();
      (u && (s[e].url = u),
        localStorage.setItem("aggle-quick-links", JSON.stringify(s)),
        h());
    };
    (l.addEventListener("blur", d),
      l.addEventListener("keydown", (u) => {
        (u.key === "Enter" && d(), u.key === "Escape" && h());
      }));
  }
  function E() {
    let e = new Date().getHours(),
      s =
        e < 5
          ? "Good night"
          : e < 12
            ? "Good morning"
            : e < 17
              ? "Good afternoon"
              : "Good evening";
    c("#greeting").textContent = s;
  }
  function b() {
    let e = new Date(),
      s = e.getHours() % 12 || 12,
      a = e.getMinutes().toString().padStart(2, "0"),
      t = e.getHours() >= 12 ? "PM" : "AM";
    c("#clock-time").textContent = `${s}:${a} ${t}`;
    let n = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      i = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
    c("#clock-date").textContent =
      `${n[e.getDay()]}, ${i[e.getMonth()]} ${e.getDate()}`;
  }
  function m(e) {
    browser.tabs.update({ url: e });
  }
  function w(e) {
    let s = window._aggleEngine || "duckduckgo",
      a = p[s] || p.duckduckgo;
    m(a.search(e));
  }
  function L(e) {
    return e
      ? !!(
          /^https?:\/\//i.test(e) ||
          /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}/.test(e) ||
          /^localhost(?::\d+)?\/?$/.test(e) ||
          /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?$/.test(e)
        )
      : !1;
  }
  function M() {
    let e = c("#address-input"),
      s = c("#address-icon"),
      a = c("#engine-btn"),
      t = c("#engine-dd");
    t.innerHTML = "";
    for (let [o, r] of Object.entries(p)) {
      let g = document.createElement("button");
      ((g.className = "engine-opt"),
        (g.dataset.engine = o),
        (g.innerHTML = `<span class="engine-opt-icon">${r.icon}</span><span>${r.name}</span>`),
        t.appendChild(g));
    }
    let n = c("#engine-icon"),
      i = !1;
    function l() {
      let o = window._aggleEngine || "duckduckgo";
      n.textContent = (p[o] || p.duckduckgo).icon;
    }
    function d(o) {
      o &&
        ((e.value = o),
        o.startsWith("https://")
          ? (s.textContent = "\u{1F512}")
          : o.startsWith("http://")
            ? (s.textContent = "\u26A0\uFE0F")
            : o.startsWith("about:")
              ? (s.textContent = "\u2139\uFE0F")
              : (s.textContent = "\u{1F50D}"));
    }
    (browser.tabs.onUpdated.addListener((o, r, g) => {
      g.url &&
        g.status === "complete" &&
        browser.tabs.query({ active: !0, currentWindow: !0 }).then(([f]) => {
          f?.id === g.id && d(g.url);
        });
    }),
      browser.tabs.onActivated.addListener(({ tabId: o }) => {
        browser.tabs.get(o).then((r) => d(r.url));
      }),
      e.addEventListener("keydown", (o) => {
        if (o.key === "Enter") {
          o.preventDefault();
          let r = e.value.trim();
          if (!r) return;
          (L(r) ? m(r.startsWith("http") ? r : `https://${r}`) : w(r),
            e.blur());
        }
      }),
      e.addEventListener("focus", () => {
        e.select();
      }),
      a.addEventListener("click", (o) => {
        (o.stopPropagation(),
          (i = !i),
          (t.hidden = !i),
          t.classList.toggle("open", i));
      }),
      document.addEventListener("click", (o) => {
        i &&
          !t.contains(o.target) &&
          o.target !== a &&
          ((i = !1), (t.hidden = !0), t.classList.remove("open"));
      }),
      t.querySelectorAll(".engine-opt").forEach((o) => {
        o.addEventListener("click", () => {
          let r = o.dataset.engine;
          (r &&
            ((window._aggleEngine = r),
            localStorage.setItem("aggle-search-engine", r),
            l()),
            (i = !1),
            (t.hidden = !0),
            t.classList.remove("open"));
        });
      }));
    let u = localStorage.getItem("aggle-search-engine");
    (u && u in p && (window._aggleEngine = u), l());
  }
  function T() {
    let e = c("#btn-back"),
      s = c("#btn-fwd");
    c("#btn-reload").addEventListener("click", () => {
      browser.tabs.query({ active: !0, currentWindow: !0 }).then(([i]) => {
        i?.id !== void 0 && browser.tabs.reload(i.id, { bypassCache: !0 });
      });
    });
    let t = [],
      n = -1;
    (browser.tabs.onUpdated.addListener((i, l, d) => {
      d.url &&
        (t[n] !== d.url &&
          ((t = t.slice(0, n + 1)), t.push(d.url), (n = t.length - 1)),
        (e.disabled = n <= 0),
        (s.disabled = n >= t.length - 1));
    }),
      e.addEventListener("click", () => {
        n > 0 && (n--, m(t[n]));
      }),
      s.addEventListener("click", () => {
        n < t.length - 1 && (n++, m(t[n]));
      }));
  }
  function y() {
    let e = c("#btn-stats"),
      s = c("#btn-palette"),
      sb = c("#btn-sidebar");
    (sb &&
      sb.addEventListener("click", () => {
        browser.runtime.sendMessage({ action: "toggleSidebar" });
      }),
      s.addEventListener("click", () => {
        browser.tabs.query({ active: !0, currentWindow: !0 }).then(([a]) => {
          a?.id !== void 0 &&
            browser.tabs
              .sendMessage(a.id, { action: "palette:open" })
              .catch(() => {
                browser.tabs
                  .create({ url: "about:blank", active: !0 })
                  .then((t) => {
                    t?.id !== void 0 &&
                      setTimeout(() => {
                        browser.tabs
                          .sendMessage(t.id, { action: "palette:open" })
                          .catch(() => {});
                      }, 300);
                  });
              });
        });
      }));
  }
  (async () => (E(), b(), setInterval(b, 1e3), h(), M(), T(), y()))();
})();
