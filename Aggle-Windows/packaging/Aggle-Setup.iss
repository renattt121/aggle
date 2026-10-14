; ============================================================================
; Inno Setup Script for Aggle Browser (Windows)
; Creates a standalone Windows Installer (Aggle-Setup.exe)
; ============================================================================

#define MyAppName "Aggle Browser"
#define MyAppVersion "1.1.0"
#define MyAppPublisher "Aggle Project"
#define MyAppURL "https://aggle.dev"
#define MyAppExeName "Aggle.vbs"

[Setup]
AppId={{5E65D2C1-30D8-4C8D-9E9C-A9D4E2F1A001}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\Aggle
DisableProgramGroupPage=yes
OutputDir=..\dist
OutputBaseFilename=Aggle-Windows-Setup
SetupIconFile=aggle.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Copy all project directories and assets into the installation folder
Source: "..\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "packaging\dist\*,*.git*"

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\launcher\aggle-launcher.vbs"""; IconFilename: "{app}\launcher\aggle.ico"; Comment: "Aggle Liquid Glass Browser"
Name: "{autodesktop}\{#MyAppName}"; Filename: "wscript.exe"; Parameters: """{app}\launcher\aggle-launcher.vbs"""; IconFilename: "{app}\launcher\aggle.ico"; Tasks: desktopicon; Comment: "Aggle Liquid Glass Browser"

[Run]
Filename: "wscript.exe"; Parameters: """{app}\launcher\aggle-launcher.vbs"""; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
