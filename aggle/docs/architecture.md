# Aggle Browser — System Architecture

## Overview

Aggle is a standalone macOS application that wraps LibreWolf with a custom glassmorphism skin, native AI sidebar, ad blocking, and a command palette. The app is a thin launcher that manages a dedicated Firefox profile and launches LibreWolf with that profile.

```
┌─────────────────────────────────────────────────────┐
│                    Aggle.app                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │            aggle-launcher (Python)           │    │
│  │                                             │    │
│  │  1. Create / verify profile                 │    │
│  │  2. Copy chrome CSS → profile/chrome/       │    │
│  │  3. Write user.js prefs                     │    │
│  │  4. Extract XPI → profile/extensions/       │    │
│  │  5. Launch LibreWolf --profile PROFILE      │    │
│  └─────────────────────────────────────────────┘    │
│                          │                          │
│                          ▼                          │
│  ┌─────────────────────────────────────────────┐    │
│  │       LibreWolf (Firefox-based)              │    │
│  │                                             │    │
│  │  ┌─ userChrome.css ────────────────────┐    │    │
│  │  │  Glass tab strip (36px)              │    │    │
│  │  │  Glass nav bar (44px)                │    │    │
│  │  │  macOS traffic lights                │    │    │
│  │  │  Specular highlight + film grain     │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  │                                             │    │
│  │  ┌─ Aggle Extension ────────────────────┐    │    │
│  │  │  AI Sidebar (native sidebar_action)  │    │    │
│  │  │  Ad Blocker (webRequest listener)    │    │    │
│  │  │  Stats Dashboard                     │    │    │
│  │  │  Command Palette (Cmd+K)             │    │    │
│  │  │  Custom New Tab                      │    │    │
│  │  └─────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Launcher (`launcher/aggle-launcher`)

The launcher is a Python 3 script that orchestrates the profile setup and LibreWolf launch.

### Profile Location

```
~/Library/Application Support/Aggle/Profiles/default/
├── chrome/
│   ├── userChrome.css      # Browser chrome skin
│   └── userContent.css     # Web content skin
├── extensions/
│   └── aggle@aggle.dev/    # Extracted extension
├── prefs.js                # LibreWolf preferences (auto-generated)
├── user.js                 # Aggle overrides (auto-generated)
└── chrome注册/               # (if needed for future)
```

### Startup Sequence

```python
PROFILE = Path.home() / "Library/Application Support/Aggle/Profiles/default"

1. Ensure PROFILE/chrome/ exists
2. Ensure PROFILE/extensions/ exists
3. Copy bundled userChrome.css → PROFILE/chrome/
4. Copy bundled userContent.css → PROFILE/chrome/
5. Generate and write user.js:
   - toolkit.legacyUserProfileCustomizations.stylesheets = true
   - privacy.resistFingerprinting = 1
   - network.dns.disableIPv6 = true
   - Various performance prefs based on selected resource profile
6. Extract aggle-extension.xpi → PROFILE/extensions/aggle@aggle.dev/
   - Read zip manifest.json for extension ID
   - Extract all files preserving directory structure
7. subprocess.run(["open", "-a", "/Applications/LibreWolf.app",
                   "--args", "--profile", str(PROFILE)])
```

### user.js Generation

The launcher writes a `user.js` that LibreWolf reads on startup. This file contains:

```javascript
// Browser chrome
userPref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
userPref("toolkit.proton.tabs.enabled", true);
userPref("browser.tabs.drawInTitlebar", false);  // native titlebar for macOS
userPref("browser.newtabpage.enabled", true);

// Privacy (LibreWolf defaults)
userPref("privacy.resistFingerprinting", 1);
userPref("privacy.trackingprotection.enabled", true);
userPref("network.dns.disableIPv6", true);

// Performance
userPref("browser.cache.memory.enable", true);
userPref("browser.cache.memory.capacity", 512000);

// Aggle-specific
userPref("extensions.aggle.enabled", true);
```

## Chrome CSS (`chrome/`)

### userChrome.css

Controls the browser chrome — tabs, navigation bar, sidebar, menus.

**Layout Structure:**

```
┌─────────────────────────────────────────────────────┐
│  ●  GitHub  YouTube  Reddit      [+]  [≡]          │  ← #TabsToolbar (36px)
├─────────────────────────────────────────────────────┤
│ ← → ⟳   🦆 [https://example.com              ] ⭐  │  ← #nav-bar (44px)
├─────────────────────────────────────────────────────┤
│                                                     │
│                    page content                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Key CSS Techniques:**

- **Frosted glass:** `backdrop-filter: blur(32px) saturate(180%); background: rgba(10, 10, 10, 0.75);`
- **Specular highlight:** Pseudo-element `::after` with linear gradient white-to-transparent at top edge
- **Film grain:** `::after` pseudo-element with SVG noise texture at low opacity
- **Tab strip separation:** `#navigator-toolbox { display: flex; flex-direction: column; }` creates two distinct rows
- **Traffic lights:** Custom positioned dots matching macOS HIG colors (#FF5F57, #FEBC2E, #28C840)
- **Address bar pill:** Centered glass container with orange glow on focus (`box-shadow: 0 0 0 3px rgba(255,90,31,0.15)`)
- **Auto-hide toolbar:** `transform: translateY(-100%)` on scroll down, snap back on scroll up

### userContent.css

Controls web content appearance — new tab page, context menus, forms, links.

**Key styles:**
- New tab: dark background (#0A0A0A), liquid glass cards, ember gradient accents
- Context menus: `backdrop-filter: blur(24px) saturate(160%)`
- Form inputs: glass style with orange focus ring
- Links: ember accent color (#FF8A3D)
- Primary buttons: ember gradient background
- Selection: rgba(255, 90, 31, 0.3)

## Extension (`extension/`)

The WebExtension provides all interactive features. It runs in both extension mode and native sidebar mode.

### Manifest (`manifest.json`)

```json
{
  "manifest_version": 2,
  "version": "1.0.0",
  "applications": {
    "gecko": {
      "id": "aggle@aggle.dev",
      "strict_min_version": "115.0"
    }
  },
  "sidebar_action": {
    "default_panel": "sidebar/panel.html",
    "default_title": "Aggle AI",
    "default_width": 280
  },
  "browser_action": { ... },
  "content_scripts": [ ... ],
  "background": { ... }
}
```

### Architecture

```
extension/
├── background.ts     # Message router, blocker engine init, badge updates
├── content.ts        # Page context extraction, command palette injection
├── types.ts          # Shared interfaces (Message, Provider, Filter, etc.)
│
├── sidebar/
│   ├── panel.html    # AI sidebar UI shell
│   ├── panel.ts      # Sidebar controller (providers, streaming, markdown)
│   ├── client.ts     # Streaming fetch for OpenAI-compatible APIs
│   ├── chat.ts       # Conversation history + prompt building
│   ├── markdown.ts   # Safe markdown renderer (no HTML injection)
│   ├── palette.ts    # Command palette overlay
│   └── providers/
│       ├── types.ts  # ProviderDefinition shape
│       └── registry.ts # Built-in + custom provider loading
│
├── blocker/
│   ├── engine.ts     # webRequest listener, regex rule pool
│   ├── parser.ts     # ABP filter syntax → RegExp
│   ├── lists.ts      # Bundled default filter list
│   ├── ui.ts         # Toolbar badge, toggle helpers
│   └── types.ts      # Filter, FilterList, BlockerStats
│
├── options/
│   ├── options.html  # Tabbed settings UI
│   ├── options.css   # Glass-style settings stylesheet
│   └── options.ts    # Settings controller (load/save/live preview)
│
├── stats/
│   ├── dashboard.html
│   ├── dashboard.css
│   └── dashboard.ts  # Tab info + stats display
│
├── newtab/
│   ├── newtab.html
│   ├── newtab.css    # Liquid glass new tab design
│   └── newtab.ts     # Clock, search, quick links
│
└── commands/
    └── shortcuts.ts  # Custom shortcut handlers
```

### Message Protocol

The extension uses a typed message protocol for communication between components:

```typescript
type Message =
  | { type: "AGGLE_SIDEBAR_OPEN"; context: PageContext }
  | { type: "AGGLE_SIDEBAR_CLOSE" }
  | { type: "AGGLE_SEND_MESSAGE"; prompt: string; context: PageContext }
  | { type: "AGGLE_BLOCKER_TOGGLE"; site: string }
  | { type: "AGGLE_GET_STATS" }
  | { type: "AGGLE_STATS_RESPONSE"; data: BlockerStats }
  | { type: "AGGLE_COMMAND_PALETTE_OPEN" }
  | { type: "AGGLE_COMMAND_PALETTE_EXECUTE"; command: string }
  | { type: "AGGLE_THEME_UPDATE"; theme: ThemeConfig };
```

## Build System

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run build` | `esbuild prod` | Compile TypeScript to JS bundles |
| `npm run dev` | `esbuild watch` | Hot-reload development build |
| `npm run test` | `vitest` | Run 97 unit tests |
| `npm run package-app` | `./scripts/package-app.sh` | Build + package .app bundle |

### Package Script (`scripts/package-app.sh`)

```bash
1. npm run build                          # Compile extension
2. Package XPI:
   - cd extension
   - zip -r ../aggle-extension.xpi manifest.json dist/ src/ public/
3. Create .app bundle:
   - mkdir -p Aggle.app/Contents/{MacOS,Resources/{chrome,extensions}}
   - Copy launcher → MacOS/aggle-launcher
   - Copy chrome CSS → Resources/chrome/
   - Copy XPI → Resources/aggle-extension.xpi
   - Copy Info.plist → Contents/
4. Generate icon (if rsvg-convert available):
   - SVG → PNG at 16/32/64/128/256px
   - iconutil → Aggle.icns
5. chmod +x MacOS/aggle-launcher
```

## Profile Management

### First Launch

```
~/Library/Application Support/Aggle/Profiles/default/
├── chrome/userChrome.css      ← from Resources/chrome/
├── chrome/userContent.css     ← from Resources/chrome/
├── extensions/aggle@aggle.dev/
│   ├── manifest.json
│   ├── dist/panel.js          ← from XPI
│   └── ...
├── user.js                    ← generated
└── prefs.js                   ← LibreWolf default (created by Firefox)
```

### Updates

On each launch, the launcher:
1. Copies fresh chrome CSS (ensures skin stays current)
2. Regenerates user.js (applies any new prefs)
3. Does NOT re-extract the extension (avoids losing user data)
4. Does NOT overwrite prefs.js (preserves user settings)

### Data Persistence

User data is stored in the Firefox profile:
- `places.sqlite` — bookmarks, history
- `cookies.sqlite` — cookies, logins
- `storage/` — localStorage, IndexedDB
- `extensions/` — extension state
- `sessionstore-backups/` — session restore

These survive app updates and are not touched by the launcher.
