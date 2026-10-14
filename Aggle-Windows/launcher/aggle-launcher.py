#!/usr/bin/env python3
"""
Aggle Browser Launcher for Windows
Initializes the Aggle profile, registers the Aggle extension,
syncs Liquid Glass styles, and launches LibreWolf/Firefox.
"""

import os
import re
import sys
import json
import shutil
import subprocess
import time
import uuid
import zipfile
from pathlib import Path
from typing import Optional, List

# ─── Paths ───────────────────────────────────────────────────────────────────

APPDATA = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
LOCALAPPDATA = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))

AGGLE_DIR = APPDATA / "Aggle"
PROFILE_DIR = AGGLE_DIR / "Profiles" / "default"
CHROME_DIR = PROFILE_DIR / "chrome"
EXTENSIONS_DIR = PROFILE_DIR / "extensions"

ROOT_DIR = Path(__file__).resolve().parent.parent
CHROME_SRC = ROOT_DIR / "chrome"
PROFILE_SRC = ROOT_DIR / "profile"
EXTENSION_XPI = ROOT_DIR / "extension" / "aggle-extension.xpi"

# Standard Windows LibreWolf / Firefox binary locations
CANDIDATE_BINARIES = [
    LOCALAPPDATA / "Programs" / "LibreWolf" / "librewolf.exe",
    Path(r"C:\Program Files\LibreWolf\librewolf.exe"),
    Path(r"C:\Program Files (x86)\LibreWolf\librewolf.exe"),
    LOCALAPPDATA / "Mozilla Firefox" / "firefox.exe",
    Path(r"C:\Program Files\Mozilla Firefox\firefox.exe"),
    Path(r"C:\Program Files (x86)\Mozilla Firefox\firefox.exe"),
]


def log(msg: str) -> None:
    print(f"[Aggle Windows] {msg}", file=sys.stderr)


def setup_profile() -> None:
    """Create or update the Aggle user profile on Windows."""
    log("Setting up Windows profile...")
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    CHROME_DIR.mkdir(exist_ok=True)
    EXTENSIONS_DIR.mkdir(exist_ok=True)

    # 1. Synchronize chrome stylesheets
    for css_file in ("userChrome.css", "userContent.css"):
        src = CHROME_SRC / css_file
        dst = CHROME_DIR / css_file
        if src.exists():
            shutil.copy2(src, dst)
            log(f"Synchronized stylesheet: {css_file}")

    # 2. Synchronize user.js
    src_userjs = PROFILE_SRC / "user.js"
    if src_userjs.exists():
        shutil.copy2(src_userjs, PROFILE_DIR / "user.js")
        log("Synchronized user preferences: user.js")

    # 3. Install extension
    if EXTENSION_XPI.exists():
        install_extension(EXTENSION_XPI)
    else:
        log("Warning: aggle-extension.xpi not found in extension/")

    # 4. Clear startupCache to ensure CSS changes render immediately
    clear_caches()


def install_extension(xpi_path: Path) -> None:
    """Install and register the Aggle WebExtension."""
    dest = EXTENSIONS_DIR / "aggle@aggle.dev.xpi"
    shutil.copy2(xpi_path, dest)

    now = int(time.time() * 1000)
    version = "1.1.0"
    try:
        with zipfile.ZipFile(xpi_path, "r") as zf:
            if "manifest.json" in zf.namelist():
                mf = json.loads(zf.read("manifest.json").decode("utf-8"))
                version = mf.get("version", version)
    except Exception:
        pass

    escaped_path = str(dest).replace("\\", "/")
    entry = {
        "id": "aggle@aggle.dev",
        "syncGUID": "{%s}" % uuid.uuid4(),
        "version": version,
        "type": "extension",
        "loader": None,
        "updateURL": None,
        "installOrigins": None,
        "manifestVersion": 2,
        "optionsURL": "src/options/options.html",
        "optionsType": 3,
        "optionsBrowserStyle": False,
        "aboutURL": None,
        "defaultLocale": {
            "name": "Aggle",
            "description": "Aggle — premium privacy browser layer",
            "creator": None, "developers": None,
            "translators": None, "contributors": None,
        },
        "visible": True,
        "active": True,
        "userDisabled": False,
        "appDisabled": False,
        "embedderDisabled": False,
        "installDate": now,
        "updateDate": now,
        "applyBackgroundUpdates": 1,
        "path": str(dest),
        "skinnable": False,
        "sourceURI": None,
        "releaseNotesURI": None,
        "softDisabled": False,
        "foreignInstall": False,
        "strictCompatibility": True,
        "locales": [],
        "targetApplications": [
            {"id": "toolkit@mozilla.org", "minVersion": "115.0", "maxVersion": None}
        ],
        "targetPlatforms": [],
        "signedState": 0,
        "signedTypes": None,
        "signedDate": 0,
        "seen": True,
        "dependencies": [],
        "incognito": "spanning",
        "userPermissions": {
            "permissions": ["tabs", "storage", "webRequest", "webRequestBlocking",
                            "browsingData", "privacy", "activeTab", "clipboardWrite"],
            "origins": ["<all_urls>"],
            "data_collection": ["none"],
        },
        "optionalPermissions": {"permissions": [], "origins": [], "data_collection": []},
        "requestedPermissions": {"permissions": [], "origins": [], "data_collection": []},
        "icons": {"48": "public/icons/aggle-icon.svg", "96": "public/icons/aggle-icon.svg"},
        "iconURL": None,
        "blocklistAttentionDismissed": False,
        "blocklistState": 0,
        "blocklistURL": None,
        "startupData": None,
        "hidden": False,
        "installTelemetryInfo": None,
        "recommendationState": None,
        "rootURI": f"jar:file:///{escaped_path}!/",
        "location": "app-profile",
    }

    db_path = PROFILE_DIR / "extensions.json"
    db = {"addons": [], "schemaVersion": 31}
    if db_path.exists():
        try:
            db = json.loads(db_path.read_text(encoding="utf-8"))
        except (ValueError, OSError):
            pass
    db.setdefault("addons", [])
    db["addons"] = [a for a in db["addons"] if a.get("id") != "aggle@aggle.dev"]
    db["addons"].append(entry)
    db_path.write_text(json.dumps(db, indent=1), encoding="utf-8")
    log("Registered extension in extensions.json")


def clear_caches() -> None:
    """Clear startupCache for LibreWolf/Firefox to ensure CSS changes show immediately."""
    for base in [LOCALAPPDATA / "LibreWolf" / "Profiles", LOCALAPPDATA / "Aggle" / "Profiles"]:
        if base.exists():
            for p in base.glob("*"):
                sc = p / "startupCache"
                if sc.exists():
                    shutil.rmtree(sc, ignore_errors=True)
                    log(f"Cleared cache in {p.name}")


def find_browser() -> Optional[Path]:
    """Find installed LibreWolf or Firefox binary."""
    for candidate in CANDIDATE_BINARIES:
        if candidate.exists():
            return candidate
    return None


def launch(browser_args: Optional[List[str]] = None) -> None:
    """Setup profile and launch browser."""
    setup_profile()
    browser_bin = find_browser()

    if not browser_bin:
        log("No browser found. Attempting to install LibreWolf via winget...")
        try:
            subprocess.run(["winget", "install", "LibreWolf.LibreWolf", "--accept-source-agreements", "--accept-package-agreements"], check=True)
            browser_bin = find_browser()
        except Exception as e:
            log(f"Winget install failed: {e}")

    if not browser_bin:
        log("Error: LibreWolf or Firefox not found. Please install from https://librewolf.net")
        sys.exit(1)

    log(f"Launching {browser_bin} with profile {PROFILE_DIR}...")
    args = [str(browser_bin), "--profile", str(PROFILE_DIR)] + (browser_args or [])
    subprocess.Popen(args)


if __name__ == "__main__":
    launch(sys.argv[1:])
