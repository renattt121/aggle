"use strict";
(() => {
    var E = [{
            id: "ember",
            label: "Ember",
            from: "#FF5A1F",
            to: "#FF8A3D"
        }, {
            id: "frost",
            label: "Frost",
            from: "#5EA0FF",
            to: "#E8F1FF"
        }, {
            id: "void",
            label: "Void",
            from: "#1A1A1E",
            to: "#0A0A0A"
        }],
        f = {
            theme: {
                mode: "dark",
                accentHue: 18,
                accentSaturation: 100,
                blurIntensity: 24,
                grainOpacity: 15,
                backgroundPreset: "ember"
            },
            sidebar: {
                providerId: "ollama",
                model: "llama3.1",
                apiKeyGroq: "",
                apiKeyOpenai: "",
                apiKeyGemini: "",
                apiKeyXai: "",
                apiKeyCustomOpenai: "",
                ollamaUrl: "http://localhost:11434",
                customOpenaiUrl: "http://localhost:1234/v1",
                includePageContext: !0
            },
            blocker: {
                enabled: !0,
                lists: [{
                    id: "aggle-builtin",
                    name: "Aggle Base List",
                    url: "bundled:base",
                    enabled: !0,
                    bundled: !0,
                    ruleCount: 0,
                    lastUpdated: 0
                }],
                whitelist: [],
                stats: {
                    totalBlocked: 0,
                    blockedToday: 0,
                    lastResetDate: "",
                    perSite: {}
                }
            },
            performance: {
                profile: "balanced",
                processCount: 8,
                diskCacheMb: 512,
                hwVideoDecode: !0,
                webRender: !0
            },
            general: {
                customNewTab: !0,
                commandPaletteEnabled: !0,
                searchEngine: "duckduckgo"
            }
        },
        v = {
            eco: {
                processCount: 4,
                diskCacheMb: 256,
                hwVideoDecode: !1,
                webRender: !0
            },
            balanced: {
                processCount: 8,
                diskCacheMb: 512,
                hwVideoDecode: !0,
                webRender: !0
            },
            performance: {
                processCount: 12,
                diskCacheMb: 2048,
                hwVideoDecode: !0,
                webRender: !0
            }
        },
        g = "aggle-settings";

    function b(e, o) {
        if (o == null) return e;
        if (typeof e != "object" || Array.isArray(e) || typeof o != "object" || Array.isArray(o)) return o;
        let r = {
            ...e
        };
        for (let [c, a] of Object.entries(o)) r[c] = c in e ? b(e[c], a) : a;
        return r
    }
    async function h() {
        let e = await browser.storage.local.get(g);
        return b(f, e[g])
    }
    async function L(e) {
        await browser.storage.local.set({
            [g]: e
        })
    }

    function T(e) {
        let o = e.diskCacheMb * 1024;
        return ["// Aggle resource profile (drop into <profile>/user.js or Aggle.overrides.cfg)", `user_pref("dom.ipc.processCount", ${e.processCount});`, `user_pref("browser.cache.disk.capacity", ${o});`, `user_pref("browser.cache.disk.enable", ${e.diskCacheMb>0?"true":"false"});`, `user_pref("media.hardware-video-decoding.enabled", ${e.hwVideoDecode});`, `user_pref("gfx.webrender.all", ${e.webRender});`].join(`
`)
    }
    var t = e => document.querySelector(e),
        n, w;

    function s() {
        clearTimeout(w), w = window.setTimeout(async () => {
            await L(n);
            let e = t("#toast");
            e.classList.add("show"), setTimeout(() => e.classList.remove("show"), 1400)
        }, 400)
    }
    document.querySelectorAll(".nav-item").forEach(e => {
        e.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach(o => o.classList.remove("active")), document.querySelectorAll(".tab").forEach(o => o.classList.remove("active")), e.classList.add("active"), t(`#tab-${e.dataset.tab}`).classList.add("active")
        })
    });

    function u() {
        let {
            theme: e
        } = n, o = e.accentSaturation, r = e.accentHue, c = `hsl(${r} ${o}% 55%)`, a = `hsl(${r} ${o}% 67%)`;
        document.documentElement.style.setProperty("--accent", c), document.documentElement.style.setProperty("--accent-2", a), document.body.classList.toggle("oled", e.mode === "oled");
        let i = E.find(d => d.id === e.backgroundPreset) ?? E[0],
            l = t("#accent-preview");
        l.style.background = e.backgroundPreset === "void" ? `linear-gradient(135deg, ${i.from}, ${i.to})` : `linear-gradient(135deg, ${c}, ${a})`
    }

    function M() {
        document.querySelectorAll('input[name="mode"]').forEach(a => a.addEventListener("change", () => {
            n.theme.mode = a.value, u(), s()
        }));
        let e = t("#accent-hue"),
            o = t("#accent-sat");
        e.addEventListener("input", () => {
            n.theme.accentHue = +e.value, t("#accent-hue-out").textContent = `${e.value}\xB0`, u(), s()
        }), o.addEventListener("input", () => {
            n.theme.accentSaturation = +o.value, t("#accent-sat-out").textContent = `${o.value}%`, u(), s()
        });
        let r = t("#blur");
        r.addEventListener("input", () => {
            n.theme.blurIntensity = +r.value, t("#blur-out").textContent = `${r.value}px`, s()
        });
        let c = t("#grain");
        c.addEventListener("input", () => {
            n.theme.grainOpacity = +c.value, t("#grain-out").textContent = `${c.value}%`, s()
        }), document.querySelectorAll('input[name="preset"]').forEach(a => a.addEventListener("change", () => {
            n.theme.backgroundPreset = a.value, u(), s()
        })), t("#custom-newtab").addEventListener("change", a => {
            n.general.customNewTab = a.target.checked, s()
        }), document.querySelectorAll('input[name="search-engine"]').forEach(a => a.addEventListener("change", () => {
            n.general.searchEngine = a.value, localStorage.setItem("aggle-search-engine", a.value), s()
        })), t("#export-theme").addEventListener("click", () => {
            let a = new Blob([JSON.stringify(n.theme, null, 2)], {
                    type: "application/json"
                }),
                i = URL.createObjectURL(a),
                l = document.createElement("a");
            l.href = i, l.download = "aggle-theme.json", l.click(), URL.revokeObjectURL(i)
        })
    }

    function y() {
        let e = n.sidebar.providerId;
        for (let o of ["ollama", "custom_openai", "groq", "openai", "gemini", "xai"]) t(`#card-${o}`).style.display = o === e ? "" : "none"
    }

    function S() {
        let e = t("#provider-select");
        e.addEventListener("change", () => {
            n.sidebar.providerId = e.value, y(), s()
        });
        let o = t("#model-input");
        o.addEventListener("input", () => {
            n.sidebar.model = o.value.trim(), s()
        });
        let r = (c, a) => {
            let i = t(c);
            i.addEventListener("input", () => {
                n.sidebar[a] = i.value, s()
            })
        };
        r("#key-groq", "apiKeyGroq"), r("#key-openai", "apiKeyOpenai"), r("#key-gemini", "apiKeyGemini"), r("#key-xai", "apiKeyXai"), r("#key-custom-openai", "apiKeyCustomOpenai"), t("#ollama-url").addEventListener("input", c => {
            n.sidebar.ollamaUrl = c.target.value.trim(), s()
        }), t("#custom-openai-url").addEventListener("input", c => {
            n.sidebar.customOpenaiUrl = c.target.value.trim(), s()
        }), t("#include-context").addEventListener("change", c => {
            n.sidebar.includePageContext = c.target.checked, s()
        })
    }

    function p() {
        let e = t("#filter-lists");
        e.innerHTML = "";
        for (let r of n.blocker.lists) {
            let c = document.createElement("div");
            c.className = "list-item";
            let a = document.createElement("input");
            a.type = "checkbox", a.checked = r.enabled, a.addEventListener("change", () => {
                r.enabled = a.checked, s()
            });
            let i = document.createElement("span");
            i.className = "name", i.textContent = r.name;
            let l = document.createElement("span");
            if (l.className = "sub", l.textContent = r.bundled ? "bundled" : r.url, r.bundled) c.append(a, i, l);
            else {
                let d = document.createElement("button");
                d.className = "remove", d.textContent = "\u2715", d.title = "Remove list", d.addEventListener("click", () => {
                    n.blocker.lists = n.blocker.lists.filter(I => I.id !== r.id), p(), s()
                }), c.append(a, i, l, d)
            }
            e.appendChild(c)
        }
        let o = t("#whitelist");
        o.innerHTML = "", n.blocker.whitelist.length === 0 && (o.innerHTML = '<p class="hint">No whitelisted sites \u2014 the blocker is active everywhere.</p>');
        for (let r of n.blocker.whitelist) {
            let c = document.createElement("div");
            c.className = "list-item";
            let a = document.createElement("span");
            a.className = "name", a.textContent = r;
            let i = document.createElement("button");
            i.className = "remove", i.textContent = "\u2715", i.addEventListener("click", () => {
                n.blocker.whitelist = n.blocker.whitelist.filter(l => l !== r), p(), s()
            }), c.append(a, i), o.appendChild(c)
        }
    }

    function H() {
        t("#blocker-enabled").addEventListener("change", e => {
            n.blocker.enabled = e.target.checked, s()
        }), t("#add-list").addEventListener("click", () => {
            let e = t("#new-list-name").value.trim(),
                o = t("#new-list-url").value.trim();
            !e || !o.startsWith("http") || (n.blocker.lists.push({
                id: `list-${Date.now()}`,
                name: e,
                url: o,
                enabled: !0,
                bundled: !1,
                ruleCount: 0,
                lastUpdated: 0
            }), t("#new-list-name").value = "", t("#new-list-url").value = "", p(), s())
        }), t("#add-whitelist").addEventListener("click", () => {
            let e = t("#new-whitelist-host").value.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
            !e || n.blocker.whitelist.includes(e) || (n.blocker.whitelist.push(e), t("#new-whitelist-host").value = "", p(), s())
        })
    }

    function C() {
        document.querySelectorAll('input[name="profile"]').forEach(r => r.addEventListener("change", () => {
            let c = r.value;
            n.performance.profile = c, c !== "custom" && v[c] && (Object.assign(n.performance, v[c]), k()), t("#custom-profile-card").style.display = c === "custom" ? "" : "none", s()
        }));
        let e = t("#process-count");
        e.addEventListener("input", () => {
            n.performance.processCount = +e.value, n.performance.profile = "custom", m(), t("#process-count-out").textContent = e.value, s()
        });
        let o = t("#disk-cache");
        o.addEventListener("input", () => {
            n.performance.diskCacheMb = +o.value, n.performance.profile = "custom", m(), t("#disk-cache-out").textContent = o.value, s()
        }), t("#hw-video").addEventListener("change", r => {
            n.performance.hwVideoDecode = r.target.checked, n.performance.profile = "custom", m(), s()
        }), t("#webrender").addEventListener("change", r => {
            n.performance.webRender = r.target.checked, n.performance.profile = "custom", m(), s()
        }), t("#copy-userjs").addEventListener("click", async () => {
            await navigator.clipboard.writeText(T(n.performance));
            let r = t("#copy-userjs");
            r.textContent = "Copied!", setTimeout(() => r.textContent = "Copy user.js snippet", 1500)
        })
    }

    function m() {
        document.querySelectorAll('input[name="profile"]').forEach(e => {
            e.checked = e.value === n.performance.profile
        }), t("#custom-profile-card").style.display = n.performance.profile === "custom" ? "" : "none"
    }

    function k() {
        t("#process-count").value = String(n.performance.processCount), t("#process-count-out").textContent = String(n.performance.processCount), t("#disk-cache").value = String(n.performance.diskCacheMb), t("#disk-cache-out").textContent = String(n.performance.diskCacheMb), t("#hw-video").checked = n.performance.hwVideoDecode, t("#webrender").checked = n.performance.webRender, m()
    }
    async function A() {
        let e = await browser.commands.getAll(),
            o = t("#shortcut-list");
        o.innerHTML = "";
        for (let r of e) {
            let c = document.createElement("div");
            c.className = "list-item";
            let a = document.createElement("span");
            a.className = "name", a.textContent = r.description ?? r.name ?? "";
            let i = document.createElement("span");
            i.className = "kbd", i.textContent = r.shortcut ?? "not set", c.append(a, i), o.appendChild(c)
        }
    }

    function x() {
        let {
            theme: e,
            sidebar: o,
            blocker: r,
            general: c
        } = n;
        document.querySelectorAll('input[name="mode"]').forEach(a => {
            a.checked = a.value === e.mode
        }), t("#accent-hue").value = String(e.accentHue), t("#accent-hue-out").textContent = `${e.accentHue}\xB0`, t("#accent-sat").value = String(e.accentSaturation), t("#accent-sat-out").textContent = `${e.accentSaturation}%`, t("#blur").value = String(e.blurIntensity), t("#blur-out").textContent = `${e.blurIntensity}px`, t("#grain").value = String(e.grainOpacity), t("#grain-out").textContent = `${e.grainOpacity}%`, document.querySelectorAll('input[name="preset"]').forEach(a => {
            a.checked = a.value === e.backgroundPreset
        }), t("#custom-newtab").checked = c.customNewTab, document.querySelectorAll('input[name="search-engine"]').forEach(a => {
            a.checked = a.value === (localStorage.getItem("aggle-search-engine") || c.searchEngine)
        }), t("#provider-select").value = o.providerId, t("#model-input").value = o.model, t("#ollama-url").value = o.ollamaUrl, t("#custom-openai-url").value = o.customOpenaiUrl, t("#key-groq").value = o.apiKeyGroq, t("#key-openai").value = o.apiKeyOpenai, t("#key-gemini").value = o.apiKeyGemini, t("#key-xai").value = o.apiKeyXai, t("#key-custom-openai").value = o.apiKeyCustomOpenai, t("#include-context").checked = o.includePageContext, t("#blocker-enabled").checked = r.enabled, k()
    }(async () => (n = await h(), x(), u(), y(), p(), A(), M(), S(), H(), C()))();
})();