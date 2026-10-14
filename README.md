# Aggle Browser

<p align="center">
  <strong>The Premium Privacy Browser with Liquid Glass Aesthetics & Built-in AI</strong><br>
  <em>Available for macOS and Windows 10/11 * Built on LibreWolf / Firefox Gecko</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-v0.3.0--beta.1-FF5A1F?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-0A0A0A?style=for-the-badge&logo=apple&logoColor=white" alt="Platform">
  <img src="https://img.shields.io/badge/Engine-Gecko%20%2F%20LibreWolf-FF8A3D?style=for-the-badge" alt="Engine">
  <img src="https://img.shields.io/badge/License-MIT-EDEDEF?style=for-the-badge" alt="License">
</p>

---

## ✨ Overview

**Aggle** merges hardened, zero-telemetry privacy with a bespoke **Liquid Glass** dark ember user interface. Unlike traditional browsers that burden users with extensions and complex configurations, Aggle provides an integrated productivity layer right out of the box.

### Key Highlights
- **Liquid Glass Chrome**: Deep obsidian panels (`#0A0A0A`), ambient backdrop blur, subtle grain, and ember orange highlights (`#FF5A1F`).
- **AI Web Sidebar**: Instant side-by-side access to top AI assistants:
  - **DuckDuckGo AI (`duck.ai`)** — Anonymous, privacy-first AI with no account required.
  - **Google Gemini** — Fully integrated with automated top-level OAuth sign-in bypass.
  - **Claude** (Anthropic)
  - **ChatGPT** (OpenAI)
  - **Perplexity**
  - **Custom URL** option to load any web tool.
  - **"Tell me about this page"** — 1-click active tab context extraction.
- **Universal Command Palette (`Cmd+K` / `Ctrl+K`)**: Rapid navigation, tab switching, and settings without lifting your fingers from the keyboard.
- **Ultra-Compact Bookmarks Toolbar**: Sleek 26px height bar docked directly under the address bar with glass pill buttons.
- **Zero-Telemetry Hardening**: Hardened Gecko profile blocking trackers, ads, and fingerprinting by default with DNS-over-HTTPS.

---

## 🚀 Quick Start

### 🍏 macOS Installation
1. Download **`Aggle.dmg`** from the [Latest Release](https://github.com/renattt121/aggle/releases).
2. Open the disk image and drag **Aggle.app** into `/Applications`.
3. **Important First-Run Step (Gatekeeper Bypass)**:
   Because Aggle is an independent browser, macOS Gatekeeper may flag it as an unverified app. To open it without warning, open **Terminal** and run:
   ```bash
   xattr -cr /Applications/Aggle.app
   ```
4. Launch Aggle — your profile and Liquid Glass theme configure automatically!

---

### 🪟 Windows 10 & 11 Installation
Aggle includes a standalone Windows port in [`Aggle-Windows/`](./Aggle-Windows):

1. Download **`Aggle-Windows-Port.zip`** from the [Latest Release](https://github.com/renattt121/aggle/releases).
2. Extract the archive to any folder on your PC.
3. Ensure you have **LibreWolf** (or **Mozilla Firefox**) installed:
   ```powershell
   winget install LibreWolf.LibreWolf --accept-source-agreements --accept-package-agreements
   ```
4. Open the `launcher` folder:
   - Double-click **`run-aggle.bat`** to start Aggle immediately.
   - Or run **`install-aggle.ps1`** in PowerShell to add "Aggle Browser" shortcuts with high-resolution icons to your **Desktop** and **Start Menu**.

#### 🤖 AI-Assisted Setup on Windows
If you use an AI coding assistant (Claude Code, Cursor, Copilot, ChatGPT, or Antigravity):
1. Open the extracted `Aggle-Windows` folder in your AI editor.
2. Feed [`Aggle-Windows/INSTRUCTIONS_FOR_AI.md`](./Aggle-Windows/INSTRUCTIONS_FOR_AI.md) into the prompt.
3. The AI will autonomously inspect your environment, configure the profile, and verify the setup!

---

## 📁 Repository Structure

```text
aggle/
├── aggle/                             # Core macOS project & extension source
│   ├── chrome/                        # macOS Liquid Glass userChrome.css & userContent.css
│   ├── extension/                     # Aggle WebExtension source (Manifest V2)
│   ├── launcher/                      # macOS Python launcher & bundle configuration
│   └── scripts/                       # Packaging and build automation scripts
├── Aggle-Windows/                     # Complete Windows 10/11 port package
│   ├── chrome/                        # Windows-adapted userChrome.css (caption buttons & Segoe UI)
│   ├── profile/                       # Master Windows user.js preference profile
│   ├── launcher/                      # Batch, PowerShell, VBS launchers & aggle.ico
│   ├── packaging/                     # Inno Setup 6 installer script (Aggle-Setup.iss)
│   ├── .agents/skills/                # Agent Skill for automated AI workflows
│   └── INSTRUCTIONS_FOR_AI.md         # Master prompt for Windows AI agents
└── README.md                          # Repository overview
```

---

## ⌨️ Global Shortcuts

| Action | macOS | Windows |
|---|---|---|
| **Command Palette** | `Cmd + K` | `Ctrl + K` |
| **Toggle Bookmarks Bar** | `Cmd + Shift + B` | `Ctrl + Shift + B` |
| **Focus Address Bar** | `Cmd + L` | `Ctrl + L` |
| **New Tab** | `Cmd + T` | `Ctrl + T` |
| **Private Window** | `Cmd + Shift + P` | `Ctrl + Shift + P` |

---

## 🛠 Building from Source

### WebExtension (TypeScript & esbuild)
```bash
cd aggle/extension
npm install
npm run build
```

### Windows Installer (`.exe`)
```cmd
cd Aggle-Windows\packaging
build-installer.bat
```
*(Requires Inno Setup 6: `winget install JRSoftware.InnoSetup`)*

---

## 🏆 Credits & Acknowledgements

Aggle builds upon the extraordinary open-source foundation of:
- **[LibreWolf](https://librewolf.net/)** — Hardened privacy configuration, uBlock integration, and tracking protection.
- **[Mozilla Firefox](https://www.mozilla.org/)** — The robust, standards-compliant Gecko rendering engine.

---

## 📄 License

Distributed under the [MIT License](LICENSE).
