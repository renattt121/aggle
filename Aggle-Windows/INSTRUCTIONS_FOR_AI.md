# Master Instruction Manual for AI Agents: Porting & Setting up Aggle Browser on Windows

> **Directive for the AI Assistant (Claude Code, Cursor, Copilot, ChatGPT, or Antigravity)**:  
> You are acting as a **Principal Client Systems Engineer** specializing in Mozilla Firefox / LibreWolf Gecko engine internals and Windows desktop application integration.  
> Your task is to inspect the host Windows environment, provision the Aggle Browser profile, verify the stylesheets and extension registration, and launch the browser so that it achieves **100% visual and functional parity** with the macOS flagship build.

---

## 1. Visual Grounding & Reference Assets

Before making any adjustments, inspect the visual references and specifications provided in this folder:
- **Design Specification**: Read [`docs/VISUAL_SPECIFICATION.md`](./docs/VISUAL_SPECIFICATION.md) for color tokens, dimensions, and layout rules.
- **Visual Screenshots**:
  - [`docs/visual-references/reference-browser-ui.png`](./docs/visual-references/reference-browser-ui.png) — Inspect the overall window layout, active tab ember glow, address bar, compact bookmarks bar, and open AI sidebar.
  - [`docs/visual-references/reference-sidebar-panel.png`](./docs/visual-references/reference-sidebar-panel.png) — Inspect the AI Web Panel layout, provider switcher buttons, and bottom context button.
  - [`docs/visual-references/aggle-icon.svg`](./docs/visual-references/aggle-icon.svg) — Master vector icon.
  - [`launcher/aggle.ico`](./launcher/aggle.ico) — Multi-resolution Windows application icon.

---

## 2. Windows Architecture & File Invariants

On Windows, Aggle operates as a standalone profile layer over the **LibreWolf** (or Mozilla Firefox) Gecko engine:

```text
Host Environment Paths:
  Profile Root:       %APPDATA%\Aggle\Profiles\default
  Chrome Styles:      %APPDATA%\Aggle\Profiles\default\chrome\
  Extensions Folder:  %APPDATA%\Aggle\Profiles\default\extensions\
  Preferences File:   %APPDATA%\Aggle\Profiles\default\user.js
  Extension Database: %APPDATA%\Aggle\Profiles\default\extensions.json
  Startup Caches:     %LOCALAPPDATA%\LibreWolf\Profiles\*\startupCache
                      %LOCALAPPDATA%\Aggle\Profiles\*\startupCache
```

---

## 3. Autonomous Execution Protocol (Step-by-Step)

If you have shell/tool access on the user's Windows machine, execute the following steps in sequence:

### Phase 1: Engine Detection & Automatic Installation
Check whether LibreWolf or Firefox is installed. Run in PowerShell:
```powershell
$CandidatePaths = @(
    "$env:LOCALAPPDATA\Programs\LibreWolf\librewolf.exe",
    "C:\Program Files\LibreWolf\librewolf.exe",
    "C:\Program Files (x86)\LibreWolf\librewolf.exe",
    "$env:LOCALAPPDATA\Mozilla Firefox\firefox.exe",
    "C:\Program Files\Mozilla Firefox\firefox.exe"
)
$BrowserExe = $CandidatePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $BrowserExe) {
    Write-Host "Installing LibreWolf via winget..."
    winget install LibreWolf.LibreWolf --accept-source-agreements --accept-package-agreements
}
```

### Phase 2: Profile Structure Provisioning
Create the dedicated profile directories:
```powershell
$ProfileDir = "$env:APPDATA\Aggle\Profiles\default"
$ChromeDir  = "$ProfileDir\chrome"
$ExtDir     = "$ProfileDir\extensions"

@($ProfileDir, $ChromeDir, $ExtDir) | ForEach-Object {
    if (-not (Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}
```

### Phase 3: Synchronize Chrome Stylesheets
Copy `chrome/userChrome.css` and `chrome/userContent.css` into `$ChromeDir`:
```powershell
Copy-Item -Path ".\chrome\userChrome.css" -Destination "$ChromeDir\userChrome.css" -Force
Copy-Item -Path ".\chrome\userContent.css" -Destination "$ChromeDir\userContent.css" -Force
```

### Phase 4: Apply Master Preferences (`user.js`)
Copy `profile/user.js` into `$ProfileDir\user.js`:
```powershell
Copy-Item -Path ".\profile\user.js" -Destination "$ProfileDir\user.js" -Force
```
*Key Invariant: `toolkit.legacyUserProfileCustomizations.stylesheets = true` and `browser.toolbars.bookmarks.visibility = "always"` must be active.*

### Phase 5: Install & Register WebExtension
1. Copy the packaged extension into `$ExtDir`:
   ```powershell
   Copy-Item -Path ".\extension\aggle-extension.xpi" -Destination "$ExtDir\aggle@aggle.dev.xpi" -Force
   ```
2. Register `aggle@aggle.dev` inside `$ProfileDir\extensions.json` with schema version 31. *(This ensures Gecko boots the extension without blocking it as unsigned or untrusted)*.
   *(You can simply execute `launcher\run-aggle.ps1` which automates this JSON injection).*

### Phase 6: Invalidate Gecko `startupCache` (Mandatory!)
Gecko caches compiled XUL boxes and CSS bytecode. If you modify `userChrome.css` without purging this cache, your changes will NOT appear!
```powershell
Get-ChildItem -Path "$env:LOCALAPPDATA\LibreWolf\Profiles", "$env:LOCALAPPDATA\Aggle\Profiles" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $sc = Join-Path $_.FullName "startupCache"
    if (Test-Path $sc) { Remove-Item -Path $sc -Recurse -Force -ErrorAction SilentlyContinue }
}
```

### Phase 7: Create Windows Shortcuts
Run `launcher\install-aggle.ps1` to place shortcuts on the Desktop and Start Menu:
```powershell
powershell -ExecutionPolicy Bypass -File .\launcher\install-aggle.ps1
```

### Phase 8: Launch & Test
Launch LibreWolf with the explicit profile:
```powershell
Start-Process -FilePath $BrowserExe -ArgumentList @("--profile", $ProfileDir)
```
*(Or simply run `launcher\run-aggle.bat`)*

---

## 4. Critical Engineering Gotchas & Invariants

### ⚠️ Gotcha 1: The Golden Rule of Gecko XUL Box Layout
**NEVER** apply `display: flex`, `position: absolute`, or `all: unset` to native XUL toolbar containers:
- `#navigator-toolbox`
- `#TabsToolbar`
- `#nav-bar`
- `#PersonalToolbar`
- `.tabbrowser-tab`

*Why*: Gecko's internal C++ box layout engine coordinates tab widths, window dragging, and address bar positioning. Overriding `display` or `position` causes the entire toolbar to collapse to 0 height or the address bar to stretch across the full screen. Only adjust **backgrounds, borders, radii, padding, margin, opacity, and colors**.

### ⚠️ Gotcha 2: Windows Caption Buttons on the Top-Right
On macOS, window controls are traffic lights on the top-left. On Windows, they are caption buttons in `#titlebar .titlebar-buttonbox` on the **top-right**:
- Never set circular `border-radius: 50%` on `.titlebar-button` on Windows.
- Keep standard height (`36px`) and rectangular padding (`0 14px`).
- On close button hover (`.titlebar-close:hover`), set background to `#E81123` with `#FFFFFF` text.

### ⚠️ Gotcha 3: Google & OpenAI OAuth Iframe Restriction
Google enforces `X-Frame-Options: SAMEORIGIN` and intentionally rejects sign-in attempts inside iframes with error `401: malformed_request`.
- Aggle solves this via the background interceptor in `extension/dist/background.js`.
- It monitors `webRequest.onBeforeRequest` and redirects any URL matching `accounts.google.com`, `auth.openai.com`, or `appleid.apple.com` to a standard browser tab.
- Once signed in on the tab, the session cookies automatically share with the sidebar iframe. Do not remove this interceptor!

### ⚠️ Gotcha 4: Compact Bookmarks Toolbar
The bookmarks bar must be docked directly below `#nav-bar` with ultra-compact dimensions:
- Container: `#PersonalToolbar`
- Height: `26px - 28px`
- Preference: `browser.toolbars.bookmarks.visibility = "always"`

---

## 5. Visual Quality Acceptance Checklist

Once launched, verify each point against [`docs/visual-references/reference-browser-ui.png`](./docs/visual-references/reference-browser-ui.png):

- [ ] **Caption Buttons**: Top-right buttons minimize, maximize, and close smoothly. Close button turns red on hover.
- [ ] **Tab Bar**: Floating tabs with subtle borders; the active tab has an ember orange glow gradient.
- [ ] **Icons**: Back, Forward, Reload, Star, and Sidebar icons render cleanly without collapsing.
- [ ] **Address Bar**: Glass aesthetic with subtle inner glow; no bright cyan focus rings.
- [ ] **Bookmarks Bar**: Visible beneath the URL bar; compact height (~26px) with glass pill hover effects.
- [ ] **AI Sidebar**: Clicking the Aggle logo toggles the sidebar; switching between DuckDuckGo AI, Gemini, Claude, and ChatGPT works seamlessly.
- [ ] **Page Context**: Clicking "Tell me about this page" extracts the active tab's metadata.
- [ ] **Performance**: Smooth scrolling and GPU hardware acceleration active (`gfx.webrender.all: true`).
