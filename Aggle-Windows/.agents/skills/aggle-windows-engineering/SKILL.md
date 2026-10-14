---
name: aggle-windows-engineering
description: Develop, customize, debug, and package the Aggle web browser for Microsoft Windows (10 and 11) based on LibreWolf/Firefox Gecko. Covers Windows-adapted chrome styling (userChrome.css with caption buttons, userContent.css), Windows profile orchestration (%APPDATA%\Aggle), WebExtension integration with AI Sidebar (Gemini, DuckDuckGo AI, Claude, ChatGPT, Perplexity), preferences, PowerShell/Batch launchers, and Inno Setup installer packaging.
---

# Aggle Windows Browser Engineering

Aggle for Windows is a customized, privacy-first desktop browser engineered on top of the Mozilla Firefox / LibreWolf Gecko engine. It ports the signature **Liquid Glass** dark ember aesthetic, minimalist floating navigation, AI sidebar panel, and Command Palette from macOS to Windows 10 and 11 with 100% visual and functional parity.

---

## 1. Architecture & Component Map

```text
Aggle-Windows/
├── chrome/
│   ├── userChrome.css                 # Gecko chrome UI stylesheet (Liquid Glass, tabs, navbar, caption buttons)
│   └── userContent.css                # Internal page & sidebar styling (about:newtab, about:privatebrowsing)
├── profile/
│   └── user.js                        # Master preference overrides (CSS customizers, hardware acceleration, privacy)
├── extension/
│   ├── manifest.json                  # WebExtension Manifest V2 specification
│   ├── aggle-extension.xpi            # Pre-packaged production extension archive
│   ├── src/
│   │   ├── background/                # Background scripts, CSP/frame-ancestors strip, OAuth redirect
│   │   ├── sidebar/                   # AI Web Panel (Gemini, duck.ai, Claude, ChatGPT, Perplexity)
│   │   ├── newtab/                    # Minimalist clock & dashboard new tab page
│   │   ├── options/                   # Settings and configuration panel
│   │   └── stats/                     # Local privacy telemetry & tracker blocking metrics
│   └── public/
│       └── icons/                     # Extension branding and vector icons
├── launcher/
│   ├── run-aggle.bat                  # 1-Click double-clickable Windows Batch launcher
│   ├── run-aggle.ps1                  # Advanced PowerShell launcher with auto-winget fallback
│   ├── install-aggle.ps1              # Desktop & Start Menu shortcut creator
│   ├── aggle-launcher.vbs             # Silent WScript wrapper (launches without CMD window flash)
│   ├── aggle-launcher.py              # Cross-platform Python orchestrator
│   └── aggle.ico                      # Multi-resolution Windows application icon (16x16 to 256x256)
├── packaging/
│   ├── Aggle-Setup.iss                # Inno Setup 6 compiler configuration script
│   ├── build-installer.bat            # Automated batch compiler for Aggle-Windows-Setup.exe
│   └── aggle.ico                      # Installer setup wizard icon
├── .agents/skills/aggle-windows-engineering/
│   └── SKILL.md                       # This canonical engineering skill specification
├── INSTRUCTIONS_FOR_AI.md             # Master prompt for AI agents on Windows
└── README.md                          # User & developer documentation
```

---

## 2. Windows Invariants & Platform Differences

When porting or maintaining Aggle on Windows, observe these core technical distinctions:

### A. Window Controls & Titlebar Geometry
- **macOS**: Window controls are traffic-light circles (12px diameter) positioned on the **top-left**.
- **Windows**: Window controls are caption buttons (Minimize, Maximize/Restore, Close) positioned on the **top-right** within `#titlebar .titlebar-buttonbox`.
- **CSS Rule**: Never apply `border-radius: 50%` or traffic-light colors to `.titlebar-button` on Windows. Style them as sleek rectangular controls with height `36px`:
  - Hover background for Minimize/Maximize: `rgba(255, 255, 255, 0.08)`
  - Hover background for Close (`.titlebar-close`): `#E81123` with white cross glyph.

### B. Typography & Font Stacks
- Windows lacks Apple's `-apple-system` and `SF Pro Display`.
- The Windows font stack must prioritize Microsoft's modern variable fonts:
  ```css
  font-family: "Segoe UI Variable Text", "Segoe UI Variable Display", "Segoe UI", system-ui, -apple-system, sans-serif !important;
  ```

### C. File Paths & Environment Variables
- Profile root: `%APPDATA%\Aggle\Profiles\default` (e.g., `C:\Users\<User>\AppData\Roaming\Aggle\Profiles\default`).
- Startup cache: `%LOCALAPPDATA%\LibreWolf\Profiles\<profile>\startupCache` and `%LOCALAPPDATA%\Aggle\Profiles\<profile>\startupCache`.
- Engine binary:
  1. `%LOCALAPPDATA%\Programs\LibreWolf\librewolf.exe` (User install)
  2. `C:\Program Files\LibreWolf\librewolf.exe` (System 64-bit)
  3. `C:\Program Files (x86)\LibreWolf\librewolf.exe` (System 32-bit)
  4. Fallback: `firefox.exe` in `%LOCALAPPDATA%\Mozilla Firefox` or `C:\Program Files\Mozilla Firefox`.

---

## 3. Chrome Styling (`userChrome.css` & `userContent.css`)

### Design System Tokens
- **Background Palette**:
  - Pure Black: `--aggle-black: #0A0A0A`
  - Deep Panel: `--aggle-panel: #121214`
  - Elevated Glass: `--aggle-panel-2: #1A1A1E`
  - Card/Dialog: `--aggle-panel-3: #202026`
- **Borders & Separators**:
  - Subdued Line: `--aggle-line: #26262B`
  - Highlight Line: `--aggle-line-bright: #33333A`
  - Glass Border: `rgba(255, 255, 255, 0.06)`
- **Ember Accent Colors**:
  - Primary Ember: `--aggle-accent: #FF5A1F`
  - Secondary Ember: `--aggle-accent-2: #FF8A3D`
- **Text & Ink**:
  - High Contrast: `--aggle-text: #EDEDEF`
  - Muted: `--aggle-muted: #9B9BA4`

### Golden Rule of XUL Layout
> [!IMPORTANT]
> **NEVER** set `display: flex`, `position`, or `all: unset` on native XUL layout containers (`#navigator-toolbox`, `#TabsToolbar`, `#nav-bar`, `#PersonalToolbar`, `.tabbrowser-tab`).
> Gecko relies on internal box layout algorithms. Overriding these properties causes the toolbar to collapse or the URL bar to explode to full-screen height.
> Only style **colors, borders, border-radii, backgrounds, padding, margins, and opacity**.

### Bookmarks Toolbar (`#PersonalToolbar`)
- Sits directly below the address bar (`#nav-bar`).
- Minimized height: `26px`, max-height: `28px`.
- Compact item padding: `2px 7px`, subtle glass hover state.
- Always visible by default via preference:
  ```javascript
  user_pref("browser.toolbars.bookmarks.visibility", "always");
  ```

### Toolbars & SVG Icons
- Firefox native toolbar icons can collapse or fail to inherit color.
- Aggle solves this by injecting base64-encoded SVG background images on pseudo-elements (`#back-button::after`, `#forward-button::after`, `#reload-button::after`, `#star-button::after`, `#sidebar-button::after`).
- This guarantees crisp rendering on any DPI display without relying on Gecko icon manifests.

---

## 4. Extension Architecture (`aggle-extension`)

The bundled extension is a Manifest V2 WebExtension located in `extension/`.

### Core Features
1. **AI Web Panel (`src/sidebar/panel.html` & `panel.js`)**:
   - Supports switching between:
     - **Google Gemini** (`https://gemini.google.com/app`)
     - **DuckDuckGo AI** (`https://duckduckgo.com/?q=DuckDuckGo+AI&ia=chat&duckai=1`)
     - **Claude** (`https://claude.ai`)
     - **ChatGPT** (`https://chatgpt.com`)
     - **Perplexity** (`https://www.perplexity.ai`)
     - **Custom Web URL**
   - **Page Context Extraction**: "Tell me about this page" button copies the active tab's title, URL, and page text into clipboard and opens the AI panel.
   - **OAuth / Google Sign-In Redirect**: An interceptor in `dist/background.js` detects navigation to `accounts.google.com`, `auth.openai.com`, and `appleid.apple.com` and automatically redirects them into regular browser tabs. This circumvents Google's 401 Malformed Request iframe block.
   - **Header Stripping**: WebRequest blocking listener strips `x-frame-options`, `frame-options`, and `content-security-policy: frame-ancestors` on subframes to permit iframing AI providers.
2. **Command Palette (`src/background/`)**:
   - Quick action dialog triggered via keyboard shortcuts (`Ctrl+K` / `Ctrl+Shift+K`).
3. **Tab Groups & Workspaces**:
   - Organized workspace switching (Work, Personal, Research).

### Registration in `extensions.json`
Modern Gecko disables side-loaded extensions unless explicitly registered in the profile's `extensions.json` database and allowed in `user.js`:
```javascript
user_pref("xpinstall.signatures.required", false);
user_pref("extensions.autoDisableScopes", 0);
user_pref("extensions.enabledScopes", 15);
```
The launcher automatically parses and injects the `aggle@aggle.dev` schema into `%APPDATA%\Aggle\Profiles\default\extensions.json`.

---

## 5. Startup & Cache Invalidation Workflow

When launching Aggle or developing stylesheets on Windows:
1. Copy `chrome/userChrome.css` and `chrome/userContent.css` into `%APPDATA%\Aggle\Profiles\default\chrome\`.
2. Copy `profile/user.js` into `%APPDATA%\Aggle\Profiles\default\user.js`.
3. Copy `extension/aggle-extension.xpi` into `%APPDATA%\Aggle\Profiles\default\extensions\aggle@aggle.dev.xpi`.
4. **Invalidate Cache**: Delete `%LOCALAPPDATA%\LibreWolf\Profiles\*\startupCache` and `%LOCALAPPDATA%\Aggle\Profiles\*\startupCache`. If not purged, Gecko will continue serving cached XUL box definitions and ignore stylesheet edits.
5. Launch LibreWolf with the explicit profile flag:
   ```cmd
   librewolf.exe --profile "%APPDATA%\Aggle\Profiles\default"
   ```

---

## 6. Packaging & Deployment

To package Aggle for distribution on Windows:
- **Prerequisite**: Inno Setup 6 (`winget install JRSoftware.InnoSetup`).
- Run `packaging\build-installer.bat`.
- Produces a single, standalone installer: `dist\Aggle-Windows-Setup.exe`.
- The installer places files in `%LOCALAPPDATA%\Programs\Aggle` or `Program Files\Aggle`, creates Desktop and Start Menu shortcuts with `aggle.ico`, and sets up the silent launcher.

---

## 7. Verification Checklist for AI Agents

When testing or validating the Windows setup:
- [ ] LibreWolf / Firefox executes with `--profile "%APPDATA%\Aggle\Profiles\default"`.
- [ ] Window caption buttons (minimize, maximize, close) render on the top-right and turn red on close hover.
- [ ] Address bar displays sleek ember dark glass styling without cyan focus outline rings.
- [ ] Bookmarks toolbar (`#PersonalToolbar`) is visible under the address bar and styled compactly.
- [ ] Aggle sidebar button opens the AI panel; Google Gemini, DuckDuckGo AI, and Claude switch cleanly.
- [ ] Extension settings page (`aggle:settings`) is accessible from the sidebar.
- [ ] Smooth scrolling and hardware acceleration are enabled (`gfx.webrender.all: true`).
