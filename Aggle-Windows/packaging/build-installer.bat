@echo off
title Compile Aggle Windows Installer
echo [*] Looking for Inno Setup Compiler (ISCC.exe)...

set "ISCC_PATH="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set "ISCC_PATH=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not defined ISCC_PATH if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set "ISCC_PATH=C:\Program Files\Inno Setup 6\ISCC.exe"

if not defined ISCC_PATH (
    echo [!] Inno Setup 6 was not found in Program Files.
    echo [*] You can install it with: winget install JRSoftware.InnoSetup
    pause
    exit /b 1
)

echo [*] Compiling Aggle-Setup.iss...
"%ISCC_PATH%" "%~dp0Aggle-Setup.iss"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Installer generated at Aggle-Windows\dist\Aggle-Windows-Setup.exe
) else (
    echo.
    echo [ERROR] Inno Setup compilation failed.
)
pause
