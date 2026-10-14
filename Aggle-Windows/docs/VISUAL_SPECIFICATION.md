# Aggle Browser: Visual Design Specification & UI Breakdown

> **Reference Document for AI Agents & UI Engineers**  
> This document provides the exact visual specification, dimensions, color tokens, and screenshot references for the **Aggle Liquid Glass** browser on Microsoft Windows 10 & 11.

---

## 1. Visual Reference Assets

The original design captures are stored in [`docs/visual-references/`](./visual-references/):

| Asset | Preview Link | Description |
|---|---|---|
| **Main Browser UI** | [`docs/visual-references/reference-browser-ui.png`](./visual-references/reference-browser-ui.png) | Complete window showing top tab strip with ember active tab glow, minimal address bar, compact bookmarks bar, and open AI sidebar. |
| **AI Sidebar & Web Panel** | [`docs/visual-references/reference-sidebar-panel.png`](./visual-references/reference-sidebar-panel.png) | Close-up of the AI Web Panel showing provider tabs (DuckDuckGo AI, Gemini, Claude, ChatGPT, Perplexity), key login shortcut, and bottom context button. |
| **Vector Icon** | [`docs/visual-references/aggle-icon.svg`](./visual-references/aggle-icon.svg) | High-DPI master SVG vector icon. |
| **Windows Application Icon** | [`docs/visual-references/aggle.ico`](./visual-references/aggle.ico) | Multi-resolution Windows icon (16x16, 32x32, 48x48, 64x64, 128x128, 256x256). |

---

## 2. Window Layout & Geometry (Windows 11 vs macOS)

### macOS (Original):
```text
┌────────────────────────────────────────────────────────────────────────┐
│ [● ● ●]  Tab 1  [ Tab 2 (Active Glow) ]  Tab 3   +                     │
├────────────────────────────────────────────────────────────────────────┤
│  <  >  ↻  [ 🔒 https://aggle.dev/                  ⌘K ]  ★  [⚡AI]   ⚙ │
├────────────────────────────────────────────────────────────────────────┤
│  🔖 GitHub   🔖 Docs   🔖 X/Twitter   🔖 YouTube                       │
├───────────────────────────────────────────────────┬────────────────────┤
│                                                   │ [🤖 AI Panel]    ✕ │
│                                                   ├────────────────────┤
│                                                   │ [Duck] [Gem] [Cl]  │
│                                                   │ ────────────────── │
│                   Web Content                     │                    │
│                                                   │   AI Webview Frame │
│                                                   │                    │
│                                                   ├────────────────────┤
│                                                   │ [💬 Tell me about] │
└───────────────────────────────────────────────────┴────────────────────┘
```

### Windows 10/11 (Port Target):
```text
┌────────────────────────────────────────────────────────────────────────┐
│  Tab 1  [ Tab 2 (Active Glow) ]  Tab 3   +             [ — ] [ □ ] [ ✕ ]│  <-- Top-Right Caption Buttons!
├────────────────────────────────────────────────────────────────────────┤
│  <  >  ↻  [ 🔒 https://aggle.dev/                  Ctrl+K ]  ★ [⚡AI] ⚙ │
├────────────────────────────────────────────────────────────────────────┤
│  🔖 GitHub   🔖 Docs   🔖 X/Twitter   🔖 YouTube                       │
├───────────────────────────────────────────────────┬────────────────────┤
│                                                   │ [🤖 AI Panel]    ✕ │
│                                                   ├────────────────────┤
│                                                   │ [Duck] [Gem] [Cl]  │
│                                                   │ ────────────────── │
│                   Web Content                     │                    │
│                                                   │   AI Webview Frame │
│                                                   │                    │
│                                                   ├────────────────────┤
│                                                   │ [💬 Tell me about] │
└───────────────────────────────────────────────────┴────────────────────┘
```

---

## 3. Design Tokens (Exact Hex & CSS Values)

### A. Color Palette
```css
:root {
  /* Surface Backdrops */
  --aggle-black:       #0A0A0A; /* Pure obsidian base */
  --aggle-panel:       #121214; /* Deep frosted panel */
  --aggle-panel-2:     #1A1A1E; /* Elevated glass container */
  --aggle-panel-3:     #202026; /* Hover / Modal dialogs */

  /* Borders & Dividers */
  --aggle-line:        #26262B; /* Subtle dark divider */
  --aggle-line-bright: #33333A; /* Active/focused glass border */
  --aggle-glass-border: rgba(255, 255, 255, 0.06);

  /* Typography Colors */
  --aggle-text:        #EDEDEF; /* Crisp high-contrast foreground */
  --aggle-muted:       #9B9BA4; /* Subdued labels and shortcuts */
  --aggle-white:       #FFFFFF;

  /* Signature Ember Accents */
  --aggle-accent:      #FF5A1F; /* Vivid ember flame */
  --aggle-accent-2:    #FF8A3D; /* Radiant highlight */
  --aggle-glow:        rgba(255, 90, 31, 0.32);

  /* Windows Native Accents */
  --win-close-hover:   #E81123; /* Windows 11 red close hover */
  --win-close-active:  #BF0F1D;
}
```

### B. Typography & Font Stacks
```css
/* Windows ClearType Optimized Font Stack */
font-family: "Segoe UI Variable Text", "Segoe UI Variable Display", "Segoe UI", system-ui, -apple-system, sans-serif !important;
```

### C. Glass Effects & Blur
- **Tabs Toolbar (`#TabsToolbar`)**:
  - `backdrop-filter: blur(32px) saturate(180%) !important;`
  - Background: `linear-gradient(180deg, rgba(20, 20, 24, 0.82) 0%, rgba(14, 14, 16, 0.72) 100%) !important;`
- **Navigation Bar (`#nav-bar`)**:
  - `backdrop-filter: blur(28px) saturate(170%) !important;`
  - Background: `linear-gradient(180deg, rgba(16, 16, 18, 0.90) 0%, rgba(10, 10, 12, 0.85) 100%) !important;`
- **Bookmarks Bar (`#PersonalToolbar`)**:
  - `backdrop-filter: blur(24px) !important;`
  - Background: `rgba(14, 14, 16, 0.78) !important;`
  - Height: `min-height: 26px; max-height: 28px;`

### D. Active Tab Glow
```css
.tabbrowser-tab[selected] {
  background: linear-gradient(
    135deg,
    rgba(255, 90, 31, 0.32) 0%,
    rgba(255, 138, 61, 0.16) 100%
  ) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow:
    0 0 16px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}
```

---

## 4. Windows Caption Controls Specification

On Windows, the window controls reside in `#titlebar .titlebar-buttonbox`:
- **Placement**: Pinned to the top-right of the window titlebar.
- **Dimensions**: Height matches the tab bar (`height: 36px`), width is `46px` per button (`padding: 0 14px`).
- **Minimize & Maximize**:
  - Normal state: Transparent background, glyph color `var(--aggle-muted)`.
  - Hover state: Background `rgba(255, 255, 255, 0.08)`, glyph color `var(--aggle-text)`.
  - Active state: Background `rgba(255, 255, 255, 0.14)`.
- **Close Button (`.titlebar-close`)**:
  - Normal state: Transparent background.
  - Hover state: Background `#E81123`, glyph turns pure `#FFFFFF`.
  - Active state: Background `#BF0F1D`.

---

## 5. Bookmarks Toolbar Specification

The bookmarks toolbar must look sleek, compact, and non-intrusive:
- **Location**: Docked directly underneath `#nav-bar`.
- **Container**: `#PersonalToolbar`.
- **Height**: Fixed between `26px` and `28px`.
- **Items (`.bookmark-item`)**:
  - Border-radius: `6px`.
  - Padding: `2px 7px`.
  - Font size: `11.5px`.
  - Hover background: `rgba(255, 255, 255, 0.07)` with `#FFFFFF` text.
  - Active / Open folder: `rgba(255, 90, 31, 0.16)` with `#FFFFFF` text.
- **Preference**: `user_pref("browser.toolbars.bookmarks.visibility", "always");`.

---

## 6. AI Sidebar Panel Specification

The AI Sidebar is built into the Aggle WebExtension (`extension/src/sidebar/`):
- **Width**: `380px` (resizable).
- **Header Bar**:
  - Provider selector pills: `DuckDuckGo AI`, `Gemini`, `Claude`, `ChatGPT`, `Perplexity`, `Custom`.
  - Key button (`🔑`): Triggers external login tab for Google/OpenAI authentication.
  - Close button (`✕`): Collapses the sidebar.
- **Webview Iframe**:
  - Full-height embedded web frame with `x-frame-options` stripped by `background.js`.
- **Footer Bar**:
  - **"Tell me about this page"** button: Extracts page title, URL, and meta description into clipboard and focuses the AI input prompt.
