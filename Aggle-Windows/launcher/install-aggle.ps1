<#
.SYNOPSIS
    Aggle Browser - Windows 1-Click Desktop & Start Menu Installer
.DESCRIPTION
    Creates shortcuts for Aggle Browser on the Desktop and in the Start Menu,
    associating them with the native multi-resolution aggle.ico icon.
#>

$ErrorActionPreference = "Stop"

Write-Host @"
=============================================================
             AGGLE BROWSER SHORTCUT INSTALLER
=============================================================
"@ -ForegroundColor DarkYellow

$ScriptDir = $PSScriptRoot
$RootFolder = Split-Path -Parent $ScriptDir
$VbsLauncher = Join-Path $ScriptDir "aggle-launcher.vbs"
$BatLauncher = Join-Path $ScriptDir "run-aggle.bat"
$IconPath = Join-Path $ScriptDir "aggle.ico"

# Target launcher (prefer silent VBS, fallback to BAT)
$TargetScript = if (Test-Path $VbsLauncher) { $VbsLauncher } else { $BatLauncher }

$WshShell = New-Object -ComObject WScript.Shell

# 1. Desktop Shortcut
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$DesktopShortcutPath = Join-Path $DesktopPath "Aggle Browser.lnk"

$Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
if ($TargetScript.EndsWith(".vbs", [System.StringComparison]::OrdinalIgnoreCase)) {
    $Shortcut.TargetPath = "wscript.exe"
    $Shortcut.Arguments = "`"$TargetScript`""
} else {
    $Shortcut.TargetPath = $TargetScript
}
$Shortcut.WorkingDirectory = $RootFolder
$Shortcut.Description = "Aggle Browser - Liquid Glass Privacy Browser"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath, 0"
}
$Shortcut.Save()
Write-Host "[*] Created Desktop Shortcut: $DesktopShortcutPath" -ForegroundColor Green

# 2. Start Menu Shortcut
$StartMenuPath = [Environment]::GetFolderPath("Programs")
$StartMenuShortcutPath = Join-Path $StartMenuPath "Aggle Browser.lnk"

$StartShortcut = $WshShell.CreateShortcut($StartMenuShortcutPath)
if ($TargetScript.EndsWith(".vbs", [System.StringComparison]::OrdinalIgnoreCase)) {
    $StartShortcut.TargetPath = "wscript.exe"
    $StartShortcut.Arguments = "`"$TargetScript`""
} else {
    $StartShortcut.TargetPath = $TargetScript
}
$StartShortcut.WorkingDirectory = $RootFolder
$StartShortcut.Description = "Aggle Browser - Liquid Glass Privacy Browser"
if (Test-Path $IconPath) {
    $StartShortcut.IconLocation = "$IconPath, 0"
}
$StartShortcut.Save()
Write-Host "[*] Created Start Menu Shortcut: $StartMenuShortcutPath" -ForegroundColor Green

Write-Host "`n[SUCCESS] Aggle Browser has been installed on Windows!" -ForegroundColor Cyan
Write-Host "You can now launch Aggle from your Desktop or Start Menu."
