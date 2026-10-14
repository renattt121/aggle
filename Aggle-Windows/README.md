# Aggle Browser for Windows (Port Edition)

> **Liquid Glass Chrome * Ember Dark Theme * Privacy First * Built on LibreWolf / Firefox Gecko**

Aggle Browser is a privacy-first web browser combining a hardened Mozilla Firefox / LibreWolf Gecko engine with a bespoke **Liquid Glass** user interface, a compact bookmarks bar, an integrated AI web sidebar (Gemini, DuckDuckGo AI, Claude, ChatGPT, Perplexity), and a built-in Command Palette.

This repository is the **complete Windows 10 & 11 port package**, engineered to deliver 100% visual and functional parity with the macOS flagship build.

---

## Features at a Glance

- **Liquid Glass Design**: Deep black `#0A0A0A` and obsidian panels with subtle backdrop blur, glowing ember orange accents (`#FF5A1F`), and Windows 11-adapted caption controls.
- **Ultra-Compact Bookmarks Toolbar**: Sleek 26px height bar docked directly under the address bar with glass pill buttons and instant access.
- **AI Web Panel**: Sidebar supporting instant switching between:
  - **DuckDuckGo AI (`duck.ai`)** — Privacy-first AI with no account required
  - **Google Gemini** — With automatic top-level OAuth sign-in bypass
  - **Claude** (Anthropic)
  - **ChatGPT** (OpenAI)
  - **Perplexity**
  - **Custom URL**
  - **"Tell me about this page"** — 1-click active tab context extraction
- **Command Palette**: Rapid tab switching, workspace management, and navigation triggered via `Ctrl+K`.
- **Foolproof SVG Icons**: High-DPI inline vector icons for back, forward, reload, star, and sidebar that never disappear or glitch.
- **Zero-Telemetry Hardening**: Pre-configured `user.js` disabling diagnostic pings, telemetry, and tracking while enabling full hardware WebRender acceleration.

---

## Quick Start (30 Seconds)

### Option 1: 1-Click Batch Launcher (Easiest)
1. Ensure you have **LibreWolf** (or **Mozilla Firefox**) installed.
   *(If not installed, the launcher will offer to install LibreWolf automatically using Windows `winget`).*
2. Open the `launcher` folder.
3. Double-click **`run-aggle.bat`**.
4. Aggle Browser will set up its profile, install the extension, apply the stylesheets, and open immediately!

### Option 2: Install Desktop & Start Menu Shortcuts
Open PowerShell in the `launcher` folder and run:
```powershell
powershell -ExecutionPolicy Bypass -File .\install-aggle.ps1
```
This creates an **Aggle Browser** shortcut with the official high-resolution icon on your **Desktop** and in your **Start Menu**.

---

## Directory Overview

| Folder / File | Purpose |
|---|---|
| `chrome/userChrome.css` | Windows-adapted UI styling: tabs, URL bar, caption buttons, glass effects. |
| `chrome/userContent.css` | Internal page styling: dark new tab page, private browsing, context menus. |
| `profile/user.js` | Essential preferences (enables stylesheets, GPU acceleration, privacy rules). |
| `extension/` | Complete Aggle WebExtension source code + pre-built `aggle-extension.xpi`. |
| `launcher/run-aggle.bat` | Double-clickable batch launcher. |
| `launcher/run-aggle.ps1` | Advanced PowerShell launcher with auto-winget fallback. |
| `launcher/install-aggle.ps1` | Shortcut installer for Desktop and Start Menu. |
| `docs/VISUAL_SPECIFICATION.md` | Visual design specifications, color tokens, and screenshot references. |
| `docs/visual-references/` | Screenshots of the browser UI, AI sidebar, and icons. |
| `packaging/Aggle-Setup.iss` | Inno Setup 6 configuration script to compile `Aggle-Windows-Setup.exe`. |
| `INSTRUCTIONS_FOR_AI.md` | Master prompt and engineering guide for AI assistants on Windows. |
| `.agents/skills/` | Canonical Agent Skill (`aggle-windows-engineering`) for automated workflows. |

---

## Using with an AI Assistant (Claude, Cursor, Copilot, Antigravity)

If you or your friend are using an AI assistant on Windows:
1. Copy or extract this `Aggle-Windows` folder to your computer.
2. Open the folder in your AI coding environment (Cursor, VS Code with Claude Code / Copilot, or Antigravity).
3. Open `INSTRUCTIONS_FOR_AI.md`, copy its entire content, and paste it into the AI prompt.
4. The AI will inspect your system, ensure LibreWolf is installed, provision the profile at `%APPDATA%\Aggle\Profiles\default`, and launch the browser with 100% exact styling.

---

## Compiling a Standalone Windows Installer (`.exe`)

You can build a single, distributable `Aggle-Windows-Setup.exe` installer:
1. Install Inno Setup 6:
   ```cmd
   winget install JRSoftware.InnoSetup
   ```
2. Navigate to the `packaging` folder.
3. Double-click `build-installer.bat`.
4. The compiled installer will be saved to `dist\Aggle-Windows-Setup.exe`.

---

## Troubleshooting & Tips

- **Changes to CSS not showing up?**
  Firefox aggressively caches UI stylesheets. The launchers automatically delete the `startupCache` folder in `%LOCALAPPDATA%\LibreWolf\Profiles\*\startupCache`. You can also manually delete this folder if making live edits.
- **Google Sign-In in the AI Sidebar**:
  Google prohibits signing in inside embedded iframes ("401: malformed request"). Aggle automatically redirects sign-in flows to a regular browser tab so you can log in, and the session persists in the sidebar. You can also use the key button (`🔑`) at the top-right of the AI panel to sign in directly.
- **Bookmarks Bar Visibility**:
  If the bookmarks bar is not visible, press `Ctrl + Shift + B` or verify that `user_pref("browser.toolbars.bookmarks.visibility", "always");` is present in `%APPDATA%\Aggle\Profiles\default\user.js`.
