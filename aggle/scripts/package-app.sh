#!/bin/bash
# Aggle Browser — Package .app bundle
# Usage: ./scripts/package-app.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_NAME="Aggle"
APP_BUNDLE="$PROJECT_DIR/dist/$APP_NAME.app"
VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")

echo "=== Aggle Browser v$VERSION — Package ==="

# ─── 1. Build extension ─────────────────────────────────────────────────────
echo "[1/4] Building extension..."
cd "$PROJECT_DIR"
npm run build

# ─── 2. Package XPI ─────────────────────────────────────────────────────────
echo "[2/4] Packaging extension as XPI..."
XPI_DIR="$PROJECT_DIR/launcher/resources/aggle-extension"
XPI_PATH="$PROJECT_DIR/launcher/Resources/aggle-extension.xpi"
mkdir -p "$XPI_DIR"

# Copy dist files
cp -R "$PROJECT_DIR/extension/dist/"* "$XPI_DIR/"
cp -R "$PROJECT_DIR/extension/public/"* "$XPI_DIR/public/" 2>/dev/null || true
cp "$PROJECT_DIR/extension/manifest.json" "$XPI_DIR/"
cp -R "$PROJECT_DIR/extension/src/"* "$XPI_DIR/src/" 2>/dev/null || true

# Create XPI
cd "$XPI_DIR"
zip -r "$XPI_PATH" . -x "*.DS_Store" > /dev/null
cd "$PROJECT_DIR"
rm -rf "$XPI_DIR"
echo "  → $XPI_PATH"

# ─── 3. Build .app bundle ──────────────────────────────────────────────────
echo "[3/4] Building $APP_NAME.app..."
rm -rf "$APP_BUNDLE"

APP_CONTENTS="$APP_BUNDLE/Contents"
mkdir -p "$APP_CONTENTS/Macos"
mkdir -p "$APP_CONTENTS/Resources/chrome"
mkdir -p "$APP_CONTENTS/Resources"

# Copy launcher script
cp "$PROJECT_DIR/launcher/aggle-launcher" "$APP_CONTENTS/Macos/aggle-launcher"
chmod +x "$APP_CONTENTS/Macos/aggle-launcher"

# Copy Info.plist
cp "$PROJECT_DIR/launcher/Info.plist" "$APP_CONTENTS/Info.plist"

# Copy chrome files
cp "$PROJECT_DIR/chrome/userChrome.css" "$APP_CONTENTS/Resources/chrome/userChrome.css"
cp "$PROJECT_DIR/chrome/userContent.css" "$APP_CONTENTS/Resources/chrome/userContent.css"

# Copy extension XPI
cp "$XPI_PATH" "$APP_CONTENTS/Resources/aggle-extension.xpi"

# ─── 4. Generate icon ───────────────────────────────────────────────────────
echo "[4/4] Generating app icon..."
ICON_SRC="$PROJECT_DIR/extension/public/icons/aggle-icon.svg"
ICONSET="$APP_CONTENTS/Resources/Aggle.icns"

if command -v sips &> /dev/null; then
    # Generate icon sizes from SVG using sips
    ICONRESOURCES="$APP_CONTENTS/Resources"
    mkdir -p "$ICONRESOURCES"
    
    # Create ICNS using iconutil (requires PNGs)
    # For now, create a simple icon from the SVG
    if command -v rsvg-convert &> /dev/null; then
        for size in 16 32 64 128 256 512; do
            rsvg-convert -w $size -h $size "$ICON_SRC" -o "$ICONRESOURCES/icon_${size}x${size}.png" 2>/dev/null || true
        done
        
        ICONTEMP="/tmp/aggle-iconset.iconset"
        rm -rf "$ICONTEMP"
        mkdir -p "$ICONTEMP"
        cp "$ICONRESOURCES/icon_"*.png "$ICONTEMP/" 2>/dev/null || true
        # Ensure all required sizes exist
        for size in 16 32 48 64 128 256 512 1024; do
            if [ -f "$ICONTEMP/icon_${size}x${size}.png" ]; then
                cp "$ICONTEMP/icon_${size}x${size}.png" "$ICONTEMP/icon_${size}x${size}2x.png" 2>/dev/null || true
            fi
        done
        iconutil -c icns "$ICONTEMP" -o "$ICONRESOURCES/Aggle.icns" 2>/dev/null || true
        rm -rf "$ICONTEMP"
        rm -f "$ICONRESOURCES/icon_"*.png
    fi
fi

# ─── Done ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Done! ==="
echo "  $APP_NAME.app → $APP_BUNDLE"
echo ""
echo "To create a DMG:"
echo "  hdiutil create -volname '$APP_NAME' -srcfolder dist/ -ov -format UDZO dist/$APP_NAME.dmg"
echo ""
