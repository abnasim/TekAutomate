@echo off
color 0B
title Create Electron Distribution ZIP
echo.
echo ========================================================
echo  Creating Electron Distribution ZIP
echo ========================================================
echo.

cd /d "%~dp0"

if not exist "dist\win-unpacked" (
    color 0C
    echo ERROR: win-unpacked folder not found!
    echo.
    echo Please run: npm run electron-build-win
    echo.
    pause
    exit /b 1
)

echo Creating ZIP of win-unpacked folder...
echo This may take a moment (folder is ~200 MB)...
echo.

powershell -Command "Compress-Archive -Path 'dist\win-unpacked' -DestinationPath 'TekAutomator_v1.0_Electron.zip' -Force"

if exist "TekAutomator_v1.0_Electron.zip" (
    color 0A
    echo.
    echo ========================================================
    echo  ZIP CREATED SUCCESSFULLY!
    echo ========================================================
    echo.
    
    for %%I in (TekAutomator_v1.0_Electron.zip) do echo File: %%~nxI
    for %%I in (TekAutomator_v1.0_Electron.zip) do echo Size: %%~zI bytes
    echo.
    echo Location: %CD%\TekAutomator_v1.0_Electron.zip
    echo.
    echo ========================================================
    echo  USER INSTRUCTIONS:
    echo ========================================================
    echo.
    echo Tell users to:
    echo   1. Extract TekAutomator_v1.0_Electron.zip
    echo   2. Open the win-unpacked folder
    echo   3. Double-click: Tek Automator.exe
    echo   4. App launches!
    echo.
    echo Requirements: Windows 10/11 only (no Node.js needed)
    echo.
) else (
    color 0C
    echo.
    echo ERROR: Failed to create ZIP
    echo.
)

pause
