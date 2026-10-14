<#
.SYNOPSIS
    Aggle Browser - Advanced Windows Launcher & Profile Provisioner
.DESCRIPTION
    Sets up the Aggle Liquid Glass dark ember theme, registers the Aggle
    extension, clears startup caches, and launches LibreWolf with the Aggle profile.
#>

param(
    [switch]$DryRun,
    [string]$AppPath = "",
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$BrowserArgs
)

$ErrorActionPreference = "Stop"

function Write-AggleBanner {
    Write-Host @"
=============================================================
                  AGGLE BROWSER (WINDOWS)
     Liquid Glass Chrome * Ember Theme * Privacy First
=============================================================
"@ -ForegroundColor DarkYellow
}

Write-AggleBanner

# 1. Determine Paths
$AppData = $env:APPDATA
$LocalAppData = $env:LOCALAPPDATA
$AggleDir = Join-Path $AppData "Aggle"
$ProfileDir = Join-Path $AggleDir "Profiles\default"
$ChromeDir = Join-Path $ProfileDir "chrome"
$ExtensionsDir = Join-Path $ProfileDir "extensions"

$ScriptDir = Split-Path -Parent $PSScriptRoot
if (-not $ScriptDir -or -not (Test-Path (Join-Path $ScriptDir "chrome"))) {
    $ScriptDir = Resolve-Path (Join-Path $PSScriptRoot "..")
}

Write-Host "[*] Profile directory: $ProfileDir" -ForegroundColor Cyan

# 2. Ensure directories exist
@($AggleDir, (Join-Path $AggleDir "Profiles"), $ProfileDir, $ChromeDir, $ExtensionsDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}

# 3. Synchronize chrome stylesheets (userChrome.css, userContent.css)
$SourceChromeDir = Join-Path $ScriptDir "chrome"
if (Test-Path $SourceChromeDir) {
    Get-ChildItem -Path $SourceChromeDir -Filter "*.css" | ForEach-Object {
        $dest = Join-Path $ChromeDir $_.Name
        Copy-Item -Path $_.FullName -Destination $dest -Force
        Write-Host "[*] Installed stylesheet: $($_.Name)" -ForegroundColor Green
    }
}

# 4. Synchronize user.js
$SourceUserJs = Join-Path $ScriptDir "profile\user.js"
if (Test-Path $SourceUserJs) {
    Copy-Item -Path $SourceUserJs -Destination (Join-Path $ProfileDir "user.js") -Force
    Write-Host "[*] Applied preferences: user.js" -ForegroundColor Green
}

# 5. Install Extension (XPI)
$SourceXpi = Join-Path $ScriptDir "extension\aggle-extension.xpi"
$DestXpi = Join-Path $ExtensionsDir "aggle@aggle.dev.xpi"

if (Test-Path $SourceXpi) {
    Copy-Item -Path $SourceXpi -Destination $DestXpi -Force
    Write-Host "[*] Installed extension package: aggle@aggle.dev.xpi" -ForegroundColor Green

    # Register in extensions.json
    $DbPath = Join-Path $ProfileDir "extensions.json"
    $Now = [long]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
    $EscapedPath = $DestXpi.Replace('\', '/')

    $Db = @{ addons = @(); schemaVersion = 31 }
    if (Test-Path $DbPath) {
        try {
            $Db = Get-Content $DbPath -Raw -Encoding utf8 | ConvertFrom-Json
        } catch {
            $Db = @{ addons = @(); schemaVersion = 31 }
        }
    }

    $Addons = @($Db.addons | Where-Object { $_.id -ne "aggle@aggle.dev" })
    $Entry = [ordered]@{
        id = "aggle@aggle.dev"
        syncGUID = "{" + [guid]::NewGuid().ToString() + "}"
        version = "1.1.0"
        type = "extension"
        loader = $null
        updateURL = $null
        optionsURL = "src/options/options.html"
        optionsType = 3
        optionsBrowserStyle = $false
        defaultLocale = @{
            name = "Aggle"
            description = "Aggle - premium privacy browser layer"
        }
        visible = $true
        active = $true
        userDisabled = $false
        appDisabled = $false
        installDate = $Now
        updateDate = $Now
        path = $DestXpi
        rootURI = "jar:file:///$EscapedPath!/"
        location = "app-profile"
        userPermissions = @{
            permissions = @("tabs", "storage", "webRequest", "webRequestBlocking", "browsingData", "privacy", "activeTab", "clipboardWrite")
            origins = @("<all_urls>")
        }
        targetApplications = @(@{ id = "toolkit@mozilla.org"; minVersion = "115.0"; maxVersion = $null })
        signedState = 0
        seen = $true
    }

    $Addons += $Entry
    $Db.addons = $Addons
    $Db | ConvertTo-Json -Depth 10 | Set-Content -Path $DbPath -Encoding utf8
    Write-Host "[*] Registered extension in extensions.json" -ForegroundColor Green
}

# 6. Locate Browser Executable
$CandidatePaths = @(
    $AppPath,
    (Join-Path $LocalAppData "Programs\LibreWolf\librewolf.exe"),
    "C:\Program Files\LibreWolf\librewolf.exe",
    "C:\Program Files (x86)\LibreWolf\librewolf.exe",
    (Join-Path $LocalAppData "Mozilla Firefox\firefox.exe"),
    "C:\Program Files\Mozilla Firefox\firefox.exe"
) | Where-Object { -not [string]::IsNullOrEmpty($_) }

$BrowserExe = $CandidatePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $BrowserExe) {
    Write-Host "[!] LibreWolf or Firefox was not found." -ForegroundColor Yellow
    $Winget = Get-Command "winget" -ErrorAction SilentlyContinue
    if ($Winget) {
        $choice = Read-Host "Would you like to install LibreWolf via winget now? (Y/N)"
        if ($choice -match '^[Yy]') {
            Write-Host "[*] Running: winget install LibreWolf.LibreWolf..." -ForegroundColor Cyan
            & winget install LibreWolf.LibreWolf --accept-source-agreements --accept-package-agreements
            $BrowserExe = @(
                (Join-Path $LocalAppData "Programs\LibreWolf\librewolf.exe"),
                "C:\Program Files\LibreWolf\librewolf.exe"
            ) | Where-Object { Test-Path $_ } | Select-Object -First 1
        }
    }
}

if (-not $BrowserExe) {
    Write-Error "Could not find a compatible browser executable. Please install LibreWolf from https://librewolf.net"
    exit 1
}

Write-Host "[*] Using browser: $BrowserExe" -ForegroundColor Cyan

# 7. Clean startupCache so CSS/layout updates render immediately
$CacheDirs = @(
    (Join-Path $LocalAppData "LibreWolf\Profiles"),
    (Join-Path $LocalAppData "Aggle\Profiles")
)
foreach ($cDir in $CacheDirs) {
    if (Test-Path $cDir) {
        Get-ChildItem -Path $cDir -Directory | ForEach-Object {
            $sc = Join-Path $_.FullName "startupCache"
            if (Test-Path $sc) {
                Remove-Item -Path $sc -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

if ($DryRun) {
    Write-Host "[*] Dry run completed successfully. Browser was not started." -ForegroundColor Yellow
    exit 0
}

# 8. Launch LibreWolf with Aggle Profile
Write-Host "[*] Launching Aggle Browser..." -ForegroundColor Green
$LaunchArgs = @("--profile", $ProfileDir) + $BrowserArgs
Start-Process -FilePath $BrowserExe -ArgumentList $LaunchArgs
