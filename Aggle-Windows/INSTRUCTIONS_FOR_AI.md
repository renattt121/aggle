# INSTRUCTIONS FOR AI: Porting & Running Aggle Browser on Windows

> **Notice for the AI Assistant**:
> You are acting as a Senior Browser Systems Engineer specializing in Mozilla Firefox / LibreWolf Gecko customizations and Windows client application design.
> Your goal is to guide the user (or execute the steps autonomously) to set up and run the **Aggle Browser** on Microsoft Windows 10 or 11 with **100% visual and feature parity** with the macOS flagship build.

---

## 1. Project Background & Vision

**Aggle Browser** is a privacy-first browser that pairs the hardened Gecko engine of LibreWolf with a custom **Liquid Glass Dark Ember** user interface, a compact bookmarks toolbar, an AI web sidebar (supporting Google Gemini, DuckDuckGo AI, Claude, ChatGPT, and Perplexity), and a built-in Command Palette.

The project structure in this directory is already fully prepared:
- `chrome/userChrome.css`: Windows 11-adapted stylesheet for browser toolbars, tabs, and caption buttons.
- `chrome/userContent.css`: Internal page stylesheet (about:newtab, about:privatebrowsing, context menus).
- `profile/user.js`: Crucial Firefox Gecko preferences enabling user CSS, hardware acceleration, and privacy.
- `extension/aggle-extension.xpi`: Pre-built, production WebExtension.
- `launcher/run-aggle.bat` & `run-aggle.ps1`: Complete launchers that create profiles, register extensions, and boot the browser.
- `launcher/install-aggle.ps1`: Creates Windows Desktop and Start Menu shortcuts.
- `packaging/Aggle-Setup.iss`: Inno Setup installer script for compiling `Aggle-Windows-Setup.exe`.

---

## 2. Windows System Requirements

1. **OS**: Windows 10 (version 1809+) or Windows 11 (64-bit recommended).
2. **Browser Engine**: LibreWolf (preferred) or standard Mozilla Firefox (version 115+ ESR or Release 125+).
   - If not installed, it can be installed in seconds via Windows Package Manager:
     ```powershell
     winget install LibreWolf.LibreWolf --accept-source-agreements --accept-package-agreements
     ```
3. **PowerShell**: Windows PowerShell 5.1 or PowerShell 7 (preinstalled on Windows).

---

## 3. Step-by-Step AI Execution Plan

If you (the AI) have tool execution capabilities on the user's Windows machine, execute the following steps in sequence. If you are instructing a human user, guide them through these steps:

### Step 1: Verify or Install the Browser Engine
Check if LibreWolf exists in standard locations:
- `C:\Program Files\LibreWolf\librewolf.exe`
- `%LOCALAPPDATA%\Programs\LibreWolf\librewolf.exe`

If neither exists, run:
```powershell
winget install LibreWolf.LibreWolf --accept-source-agreements --accept-package-agreements
```

### Step 2: Initialize the Aggle Profile
The target profile directory on Windows MUST be:
`%APPDATA%\Aggle\Profiles\default`

Create the required directories:
```powershell
$ProfileDir = "$env:APPDATA\Aggle\Profiles\default"
New-Item -ItemType Directory -Path "$ProfileDir\chrome" -Force
New-Item -ItemType Directory -Path "$ProfileDir\extensions" -Force
```

### Step 3: Copy Stylesheets & Preferences
1. Copy `chrome\userChrome.css` and `chrome\userContent.css` into `$ProfileDir\chrome\`.
2. Copy `profile\user.js` into `$ProfileDir\user.js`.

### Step 4: Install & Register the Extension
1. Copy `extension\aggle-extension.xpi` into:
   `$ProfileDir\extensions\aggle@aggle.dev.xpi`
2. Update `$ProfileDir\extensions.json` to register `aggle@aggle.dev` as an active app-profile extension. (This is automated by `launcher\run-aggle.ps1` or `launcher\run-aggle.bat`).

### Step 5: Purge Startup Cache
Gecko aggressively caches XUL stylesheets. Before launching, clear:
- `%LOCALAPPDATA%\LibreWolf\Profiles\*\startupCache`
- `%LOCALAPPDATA%\Aggle\Profiles\*\startupCache`

### Step 6: Launch Aggle
Launch the browser pointing directly to the profile:
```cmd
"C:\Program Files\LibreWolf\librewolf.exe" --profile "%APPDATA%\Aggle\Profiles\default"
```
*(Or simply run `launcher\run-aggle.bat`)*

---

## 4. Design Guidelines & Invariants (Must Preserve!)

When making any code or CSS modifications, the AI **must** enforce these rules:

1. **NEVER Override Native XUL Box Layout**:
   - Do **NOT** set `display: flex`, `position: absolute`, or `all: unset` on `#navigator-toolbox`, `#TabsToolbar`, `#nav-bar`, or `#PersonalToolbar`.
   - Modifying those properties causes Gecko's internal box model to collapse, producing invisible tabs, vanishing toolbars, or an address bar that occupies the entire viewport height.
   - Only modify `background`, `border`, `border-radius`, `padding`, `margin`, `color`, and `opacity`.

2. **Windows Caption Controls**:
   - Caption buttons (Minimize, Maximize, Close) are on the top-right in `#titlebar .titlebar-buttonbox`.
   - Keep them flat with standard dimensions (`height: 36px`, `padding: 0 14px`).
   - The close button (`.titlebar-close`) must transition to background `#E81123` with `#FFFFFF` text on hover.

3. **Liquid Glass & Ember Theme Tokens**:
   - Base Black: `#0A0A0A`
   - Panels: `#121214` and `#1A1A1E`
   - Separators: `#26262B`
   - Primary Ember Accent: `#FF5A1F`
   - Active Tab Gradient: `linear-gradient(135deg, rgba(255, 90, 31, 0.32) 0%, rgba(255, 138, 61, 0.16) 100%)`
   - Font Family: `"Segoe UI Variable Text", "Segoe UI Variable Display", "Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif`

4. **Bookmarks Bar**:
   - Must be positioned directly underneath the address bar.
   - Ultra-compact height (`min-height: 26px; max-height: 28px; padding: 1px 8px`).
   - Preference `browser.toolbars.bookmarks.visibility` must be `"always"`.

5. **AI Sidebar Panel**:
   - Sidebar panel must support switching between Google Gemini, DuckDuckGo AI (`duck.ai`), Claude, ChatGPT, and Perplexity.
   - The OAuth redirect in `dist/background.js` must remain intact so Google authentication opens in a top-level tab rather than throwing an iframe error.

---

## 5. Verification Checklist

After launching the browser, confirm:
1. **Window Frame**: Dark ember liquid glass titlebar; Windows caption buttons on top-right function smoothly.
2. **Tab Bar**: Floating tabs with ember orange glow on the active tab; smooth drag-to-reorder.
3. **Address Bar**: Glass input field with subtle glow; no cyan focus ring.
4. **Bookmarks Toolbar**: Visibly docked right below the URL bar in compact mode.
5. **Sidebar**: Clicking the Aggle logo in the toolbar opens the AI sidebar; duck.ai and Gemini load properly; "Tell me about this page" extracts the active tab's context.
6. **New Tab Page**: Custom dark Aggle clock page loads instantly.

---

## 6. How to Build a Windows Installer (`.exe`)

To turn this into a professional 1-click Windows installer:
1. Install Inno Setup 6: `winget install JRSoftware.InnoSetup`
2. Run `packaging\build-installer.bat`
3. The standalone installer `dist\Aggle-Windows-Setup.exe` will be generated.
