@echo off
setlocal enabledelayedexpansion
title Aggle Browser Launcher

echo ===================================================
echo               AGGLE BROWSER (WINDOWS)
echo         Liquid Glass Chrome - Privacy First
echo ===================================================
echo.

:: 1. Define Paths
set "AGGLE_DIR=%APPDATA%\Aggle"
set "PROFILE_DIR=%AGGLE_DIR%\Profiles\default"
set "CHROME_DIR=%PROFILE_DIR%\chrome"
set "EXT_DIR=%PROFILE_DIR%\extensions"
set "SCRIPT_DIR=%~dp0.."

echo [*] Initializing Aggle profile at:
echo     %PROFILE_DIR%
echo.

:: 2. Create Profile Directories
if not exist "%PROFILE_DIR%" mkdir "%PROFILE_DIR%"
if not exist "%CHROME_DIR%" mkdir "%CHROME_DIR%"
if not exist "%EXT_DIR%" mkdir "%EXT_DIR%"

:: 3. Copy userChrome.css & userContent.css
echo [*] Installing Liquid Glass chrome styles...
if exist "%SCRIPT_DIR%\chrome\userChrome.css" (
    copy /y "%SCRIPT_DIR%\chrome\userChrome.css" "%CHROME_DIR%\userChrome.css" >nul
)
if exist "%SCRIPT_DIR%\chrome\userContent.css" (
    copy /y "%SCRIPT_DIR%\chrome\userContent.css" "%CHROME_DIR%\userContent.css" >nul
)

:: 4. Copy user.js
echo [*] Applying browser preferences (user.js)...
if exist "%SCRIPT_DIR%\profile\user.js" (
    copy /y "%SCRIPT_DIR%\profile\user.js" "%PROFILE_DIR%\user.js" >nul
)

:: 5. Install Aggle Extension (aggle@aggle.dev.xpi)
echo [*] Installing Aggle Extension (AI Panel, Command Palette, Tab Groups)...
if exist "%SCRIPT_DIR%\extension\aggle-extension.xpi" (
    copy /y "%SCRIPT_DIR%\extension\aggle-extension.xpi" "%EXT_DIR%\aggle@aggle.dev.xpi" >nul
)

:: 6. Register extension in extensions.json via PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$extPath = Join-Path $env:APPDATA 'Aggle\Profiles\default\extensions\aggle@aggle.dev.xpi';" ^
    "$dbPath = Join-Path $env:APPDATA 'Aggle\Profiles\default\extensions.json';" ^
    "if (Test-Path $extPath) {" ^
    "  $escapedExtPath = $extPath.Replace('\', '/');" ^
    "  $now = [long]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds());" ^
    "  $db = @{ addons = @(); schemaVersion = 31 };" ^
    "  if (Test-Path $dbPath) {" ^
    "    try { $db = Get-Content $dbPath -Raw | ConvertFrom-Json } catch {}" ^
    "  }" ^
    "  $addons = @($db.addons | Where-Object { $_.id -ne 'aggle@aggle.dev' });" ^
    "  $entry = [ordered]@{" ^
    "    id = 'aggle@aggle.dev';" ^
    "    syncGUID = ('{' + [guid]::NewGuid().ToString() + '}');" ^
    "    version = '1.1.0';" ^
    "    type = 'extension';" ^
    "    loader = $null;" ^
    "    updateURL = $null;" ^
    "    optionsURL = 'src/options/options.html';" ^
    "    optionsType = 3;" ^
    "    optionsBrowserStyle = $false;" ^
    "    defaultLocale = @{ name = 'Aggle'; description = 'Aggle - premium privacy browser layer' };" ^
    "    visible = $true;" ^
    "    active = $true;" ^
    "    userDisabled = $false;" ^
    "    appDisabled = $false;" ^
    "    installDate = $now;" ^
    "    updateDate = $now;" ^
    "    path = $extPath;" ^
    "    rootURI = ('jar:file:///' + $escapedExtPath + '!/');" ^
    "    location = 'app-profile';" ^
    "    userPermissions = @{" ^
    "      permissions = @('tabs', 'storage', 'webRequest', 'webRequestBlocking', 'browsingData', 'privacy', 'activeTab', 'clipboardWrite');" ^
    "      origins = @('<all_urls>');" ^
    "    };" ^
    "    targetApplications = @(@{ id = 'toolkit@mozilla.org'; minVersion = '115.0'; maxVersion = $null });" ^
    "    signedState = 0;" ^
    "    seen = $true;" ^
    "  };" ^
    "  $addons += $entry;" ^
    "  $db.addons = $addons;" ^
    "  $db | ConvertTo-Json -Depth 10 | Set-Content $dbPath -Encoding utf8;" ^
    "}" >nul 2>&1

:: 7. Find Browser Executable (LibreWolf or Firefox)
set "BROWSER_BIN="
if exist "%LOCALAPPDATA%\Programs\LibreWolf\librewolf.exe" set "BROWSER_BIN=%LOCALAPPDATA%\Programs\LibreWolf\librewolf.exe"
if not defined BROWSER_BIN if exist "C:\Program Files\LibreWolf\librewolf.exe" set "BROWSER_BIN=C:\Program Files\LibreWolf\librewolf.exe"
if not defined BROWSER_BIN if exist "C:\Program Files (x86)\LibreWolf\librewolf.exe" set "BROWSER_BIN=C:\Program Files (x86)\LibreWolf\librewolf.exe"
if not defined BROWSER_BIN if exist "%LOCALAPPDATA%\Mozilla Firefox\firefox.exe" set "BROWSER_BIN=%LOCALAPPDATA%\Mozilla Firefox\firefox.exe"
if not defined BROWSER_BIN if exist "C:\Program Files\Mozilla Firefox\firefox.exe" set "BROWSER_BIN=C:\Program Files\Mozilla Firefox\firefox.exe"

if not defined BROWSER_BIN (
    echo [!] LibreWolf or Firefox was not found on your system.
    echo.
    set /p INSTALL_CHOICE="Would you like to install LibreWolf via winget now? (Y/N): "
    if /i "!INSTALL_CHOICE!"=="Y" (
        echo [*] Installing LibreWolf...
        winget install LibreWolf.LibreWolf --accept-source-agreements --accept-package-agreements
        if exist "%LOCALAPPDATA%\Programs\LibreWolf\librewolf.exe" set "BROWSER_BIN=%LOCALAPPDATA%\Programs\LibreWolf\librewolf.exe"
        if not defined BROWSER_BIN if exist "C:\Program Files\LibreWolf\librewolf.exe" set "BROWSER_BIN=C:\Program Files\LibreWolf\librewolf.exe"
    )
)

if not defined BROWSER_BIN (
    echo.
    echo [ERROR] No compatible browser found. Please download LibreWolf from https://librewolf.net
    pause
    exit /b 1
)

:: 8. Clean startupCache so changes to CSS take effect immediately
for /d %%D in ("%LOCALAPPDATA%\LibreWolf\Profiles\*", "%LOCALAPPDATA%\Aggle\Profiles\*") do (
    if exist "%%D\startupCache" rmdir /s /q "%%D\startupCache" >nul 2>&1
)

:: 9. Launch Aggle!
echo [*] Launching Aggle Browser...
start "" "%BROWSER_BIN%" --profile "%PROFILE_DIR%" %*
exit /b 0
