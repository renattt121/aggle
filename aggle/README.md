# Aggle

Premium privacy browser layer for **LibreWolf** on macOS.

> **Current status:** Phase 1 MVP — fully working WebExtension with AI sidebar, ad blocker, stats dashboard, glass skin, and command palette.

## What's Built

| Feature | Status |
|---|---|
| **AI Sidebar** | ✅ Provider-agnostic (Ollama, Groq, OpenAI, xAI), streaming, page context |
| **Ad Blocker** | ✅ Filter parser, bundled list, per-site toggle, toolbar badge |
| **Stats Dashboard** | ✅ Live tab info, blocked counts, resource profile UI |
| **Command Palette** | ✅ Cmd+K, searchable, keyboard-navigable |
| **Glass Skin** | ✅ Frosted toolbar/tabs, grain texture, specular highlight, OLED mode |
| **Custom New Tab** | ✅ Liquid glass design — clock, search, quick links, greeting |
| **Options Page** | ✅ Tabbed settings (Appearance, AI, Privacy, Performance, Shortcuts) |
| **Resource Profiles** | ✅ Eco / Balanced / Performance / Custom with user.js generation |
| **Theme Engine** | ✅ Accent hue, blur, grain, background presets, JSON export |

## Install on LibreWolf (macOS)

```bash
cd aggle
npm install
npm run dev          # watch mode — rebuilds on save
npm run build        # production build
```

### Load the extension

1. Open LibreWolf
2. Go to `about:debugging#/runtime/this-firefox` (works in LibreWolf)
3. Click **"Load Temporary Add-on…"**
4. Select `aggle/extension/manifest.json`

The extension is now active. You'll see the Aggle icon in the toolbar and the AI sidebar is ready to use.

### Apply the liquid glass skin to the browser chrome

LibreWolf supports user Chrome stylesheets. To apply the full glass skin:

1. Open `about:support` → click **"Profile Directory"**
2. Create a `chrome/` folder inside the profile directory
3. Copy `aggle/chrome/userChrome.css` and `aggle/chrome/userContent.css` into it
4. The preference `toolkit.legacyUserProfileCustomizations.stylesheets` is already enabled via the bundled policies (`policies/librewolf.overrides.cfg`)

### Install policies (optional)

To enforce LibreWolf privacy defaults and enable user stylesheets automatically:

1. Find your LibreWolf application support folder: `~/Library/Application Support/LibreWolf/`
2. Create `distribution/policies.json` with the contents from `aggle/policies/policies.json`
3. Create `librewolf.overrides.cfg` with the contents from `aggle/policies/librewolf.overrides.cfg`

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+K` | Open command palette |
| `Cmd+J` | Toggle AI sidebar |
| `Cmd+Shift+B` | Toggle ad blocker for current site |
| `Cmd+Shift+U` | Open stats dashboard |

## Architecture

```
aggle/
├── extension/
│   ├── manifest.json        # MV2 manifest
│   ├── dist/                # compiled output (gitignored)
│   ├── public/icons/        # SVG icon
│   └── src/
│       ├── background.ts    # message router, blocker engine init
│       ├── content.ts       # page context extraction + command palette injection
│       ├── types.ts         # shared TypeScript interfaces
│       ├── utils/
│       │   ├── storage.ts   # typed settings wrapper (merge + persist)
│       │   ├── messages.ts  # typed message protocol
│       │   ├── constants.ts # brand tokens, defaults
│       │   └── prefs.ts     # LibreWolf pref helpers
│       ├── sidebar/
│       │   ├── panel.html   # AI sidebar UI
│       │   ├── panel.ts     # sidebar controller (providers, streaming, markdown)
│       │   ├── client.ts    # streaming fetch for all OpenAI-compatible providers
│       │   ├── chat.ts      # conversation history + prompt building
│       │   ├── markdown.ts  # safe markdown renderer (no HTML injection)
│       │   ├── palette.ts   # command palette overlay
│       │   └── providers/
│       │       ├── types.ts # ProviderDefinition shape
│       │       └── registry.ts # built-in + custom provider loading
│       ├── blocker/
│       │   ├── engine.ts    # webRequest listener, regex rule pool
│       │   ├── parser.ts    # ABP filter syntax → RegExp
│       │   ├── lists.ts     # bundled default filter list
│       │   ├── ui.ts        # toolbar badge, toggle helpers
│       │   └── types.ts     # Filter, FilterList, BlockerStats
│       ├── options/
│       │   ├── options.html # tabbed settings UI
│       │   ├── options.css  # glass-style settings stylesheet
│       │   └── options.ts   # settings controller (load/save/live preview)
│       ├── stats/
│       │   ├── dashboard.html
│       │   ├── dashboard.css
│       │   └── dashboard.ts # tab info + stats display
│       ├── newtab/
│       │   ├── newtab.html
│       │   ├── newtab.css   # liquid glass new tab design
│       │   └── newtab.ts    # clock, search, quick links
│       └── commands/
│           └── shortcuts.ts # custom shortcut handlers
├── chrome/
│   ├── userChrome.css       # liquid glass browser chrome skin
│   └── userContent.css      # new tab darkening, context menus
├── policies/
│   ├── policies.json
│   └── librewolf.overrides.cfg
├── mods/                    # future mod store
├── docs/                    # documentation
├── package.json
├── esbuild.ext.config.mjs
└── tsconfig.json
```

## Tech Stack

- **TypeScript** (ESNext, strict mode)
- **esbuild** for bundling (IIFE format, sourcemaps in dev)
- **No external dependencies** — the extension is fully self-contained

## Roadmap

- [x] Phase 1 MVP — all features above
- [ ] Phase 2 — macOS packaging (DMG installer)
- [ ] Phase 3 — Native resource controls (source fork)
- [ ] Phase 4 — Community mods store

## License

MIT
