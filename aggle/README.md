# Aggle

Premium privacy browser for **macOS** — LibreWolf, re-skinned with glassmorphism, AI sidebar, ad blocking, and a command palette. One-click install. No extension management.

> **Current status:** v1.0.0 — standalone macOS app with native AI sidebar, full glass skin, and all features built in.

## What's Built

| Feature | Status |
|---|---|
| **AI Sidebar** | ✅ Native sidebar — provider-agnostic (Ollama, Groq, OpenAI, xAI), streaming, page context |
| **Ad Blocker** | ✅ Filter parser, bundled list, per-site toggle, toolbar badge |
| **Stats Dashboard** | ✅ Live tab info, blocked counts, resource profile UI |
| **Command Palette** | ✅ Cmd+K, searchable, keyboard-navigable |
| **Glass Skin** | ✅ Separate tab strip + nav bar, frosted glass, grain texture, specular highlight, OLED mode |
| **Custom New Tab** | ✅ Liquid glass design — clock, search, quick links, greeting |
| **Options Page** | ✅ Tabbed settings (Appearance, AI, Privacy, Performance, Shortcuts) |
| **Resource Profiles** | ✅ Eco / Balanced / Performance / Custom with user.js generation |
| **Theme Engine** | ✅ Accent hue, blur, grain, background presets, JSON export |

## Quick Start

### System Requirements

- macOS 13.0 (Ventura) or later
- LibreWolf must be installed at `/Applications/LibreWolf.app`

### Install

1. Download the `.dmg` from the [latest release](https://github.com/lukaorieto-lab/aggle/releases)
2. Drag **Aggle.app** to your Applications folder
3. Open Aggle — the first launch sets up your profile automatically
4. LibreWolf opens with Aggle's glass skin and AI sidebar ready

### Build from Source

The project is in the `aggle/` subdirectory:

```bash
cd aggle          # ← required — package.json is here, not at repo root
cd aggle
npm install
npm run build
./scripts/package-app.sh
# Aggle.app is created in aggle/dist/
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+K` | Open command palette |
| `Cmd+J` | Toggle AI sidebar |
| `Cmd+Shift+B` | Toggle ad blocker for current site |
| `Cmd+Shift+U` | Open stats dashboard |

## Architecture

```
Aggle.app/
├── Contents/
│   ├── MacOS/
│   │   └── aggle-launcher        # Python launcher
│   ├── Resources/
│   │   ├── chrome/
│   │   │   ├── userChrome.css    # Glass tab strip + nav bar skin
│   │   │   └── userContent.css   # New tab darkening, context menus
│   │   ├── aggle-extension.xpi   # Built WebExtension
│   │   └── Aggle.icns            # App icon
│   └── Info.plist                # macOS bundle manifest
```

**Launcher flow:**
1. Creates Aggle profile at `~/Library/Application Support/Aggle/`
2. Copies chrome files into `<profile>/chrome/`
3. Writes `user.js` with LibreWolf + Aggle preferences
4. Extracts and installs the Aggle extension
5. Launches LibreWolf with the Aggle profile

See [docs/architecture.md](docs/architecture.md) for the full system breakdown.

## Manual Install (Extension-Only)

For development or when you prefer managing the extension manually:

```bash
cd aggle
npm install
npm run dev          # watch mode — rebuilds on save
npm run build        # production build
```

1. Open LibreWolf
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on…"**
4. Select `aggle/extension/manifest.json`
5. Copy `aggle/chrome/userChrome.css` and `aggle/chrome/userContent.css` into your LibreWolf profile's `chrome/` folder

## Troubleshooting

### LibreWolf not found

The launcher expects LibreWolf at `/Applications/LibreWolf.app`. If installed elsewhere, symlink it:

```bash
ln -s /path/to/LibreWolf.app /Applications/LibreWolf.app
```

### Glass skin not showing

1. Open `about:config`
2. Search for `toolkit.legacyUserProfileCustomizations.stylesheets`
3. Ensure it's set to `true`
4. Restart LibreWolf

### AI sidebar not loading

Check the provider URL in Aggle settings. For Ollama: `http://localhost:11434`
For Groq: enter your API key and use `https://api.groq.com/openai/v1`

## Tech Stack

- **TypeScript** (ESNext, strict mode)
- **esbuild** for bundling (IIFE format, sourcemaps in dev)
- **Python 3** for the launcher
- **No external dependencies** — the extension is fully self-contained

## Roadmap

- [x] Phase 1 MVP — all features above
- [x] Phase 2 — macOS standalone app (.app + DMG)
- [ ] Phase 3 — Native resource controls (source fork)
- [ ] Phase 4 — Community mods store

## License

MIT
