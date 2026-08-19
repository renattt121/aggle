# Aggle

Premium privacy browser layer for LibreWolf / Firefox.

> **Current status:** Phase 1 MVP — fully working WebExtension with AI sidebar, ad blocker, stats dashboard, glass skin, and command palette.

## What's Built

| Feature | Status |
|---|---|
| **AI Sidebar** | ✅ Provider-agnostic (Ollama, Groq, OpenAI, xAI), streaming, page context |
| **Ad Blocker** | ✅ Filter parser, bundled list, per-site toggle, toolbar badge |
| **Stats Dashboard** | ✅ Live tab info, blocked counts, resource profile UI |
| **Command Palette** | ✅ Ctrl+K / Cmd+K, searchable, keyboard-navigable |
| **Glass Skin** | ✅ Frosted toolbar/tabs, grain texture, specular highlight, OLED mode |
| **Custom New Tab** | ✅ Clock, search, quick links, greeting |
| **Options Page** | ✅ Tabbed settings (Appearance, AI, Privacy, Performance, Shortcuts) |
| **Resource Profiles** | ✅ Eco / Balanced / Performance / Custom with user.js generation |
| **Theme Engine** | ✅ Accent hue, blur, grain, background presets, JSON export |

## Install / Run

```bash
cd aggle
npm install
npm run dev          # watch mode — rebuilds on save
npm run build        # production build
npm start            # run in Firefox via web-ext
```

The extension lives in `extension/`. Install it in Firefox by:
1. Opening `about:debugging#/runtime/this-firefox`
2. Clicking "Load Temporary Add-on"
3. Selecting `extension/manifest.json`

Or run `npm start` which launches Firefox with the extension loaded automatically.

## Chrome Customization

To apply the liquid glass skin to your LibreWolf/Firefox install:
1. Open `about:support` → Profile Directory
2. Create `chrome/` folder if it doesn't exist
3. Copy `chrome/userChrome.css` and `chrome/userContent.css` there
4. Ensure `toolkit.legacyUserProfileCustomizations.stylesheets` is `true`
   (already set in `policies/librewolf.overrides.cfg`)

## Architecture

```
extension/
├── manifest.json        # MV2 manifest
├── dist/                # compiled output (gitignored)
└── src/
    ├── background.ts    # message router, blocker engine init
    ├── content.ts       # page context extraction + command palette injection
    ├── types.ts         # shared TypeScript interfaces
    ├── utils/
    │   ├── storage.ts   # typed settings wrapper (merge + persist)
    │   ├── messages.ts  # typed message protocol
    │   ├── constants.ts # brand tokens, defaults
    │   └── prefs.ts     # Firefox pref helpers
    ├── sidebar/
    │   ├── panel.html   # AI sidebar UI
    │   ├── panel.ts     # sidebar controller (providers, streaming, markdown)
    │   ├── client.ts    # streaming fetch for all OpenAI-compatible providers
    │   ├── chat.ts      # conversation history + prompt building
    │   ├── markdown.ts  # safe markdown renderer (no HTML injection)
    │   ├── palette.ts   # command palette overlay
    │   └── providers/
    │       ├── types.ts # ProviderDefinition shape
    │       └── registry.ts # built-in + custom provider loading
    ├── blocker/
    │   ├── engine.ts    # webRequest listener, regex rule pool
    │   ├── parser.ts    # ABP filter syntax → RegExp
    │   ├── lists.ts     # bundled default filter list
    │   ├── ui.ts        # toolbar badge, toggle helpers
    │   └── types.ts     # Filter, FilterList, BlockerStats
    ├── options/
    │   ├── options.html # tabbed settings UI
    │   ├── options.css  # glass-style settings stylesheet
    │   └── options.ts   # settings controller (load/save/live preview)
    ├── stats/
    │   ├── dashboard.html
    │   ├── dashboard.css
    │   └── dashboard.ts # tab info + stats display
    ├── newtab/
    │   ├── newtab.html
    │   ├── newtab.css
    │   └── newtab.ts    # clock, search, quick links
    └── commands/
        └── shortcuts.ts # custom shortcut handlers
```

## Tech Stack

- **TypeScript** (ESNext, strict mode)
- **esbuild** for bundling (IIFE format, sourcemaps in dev)
- **web-ext** for Firefox testing
- **No external dependencies** — the extension is fully self-contained

## Roadmap (from the spec)

- [x] Phase 1 MVP — all features above
- [ ] Phase 2 — Packaging (Windows installer, macOS DMG)
- [ ] Phase 3 — Source fork for native resource controls
- [ ] Phase 4 — Community mods store

## License

MIT
