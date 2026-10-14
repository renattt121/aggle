' ============================================================================
' Aggle Browser - Silent Windows Launcher
' Launches Aggle without flashing a command prompt window
' ============================================================================

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
BatPath = ScriptDir & "\run-aggle.bat"

' Run hidden (0) and do not wait for return (false)
WshShell.Run """" & BatPath & """", 0, False
