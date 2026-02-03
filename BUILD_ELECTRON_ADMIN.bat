@echo off
echo ========================================================
echo  Tek Automator - Electron Build (Run as Administrator)
echo ========================================================
echo.
echo This must be run as Administrator to avoid symlink errors.
echo.
echo If not already running as admin:
echo   1. Right-click this file
echo   2. Choose "Run as administrator"
echo.
pause

cd /d "%~dp0"

set CSC_IDENTITY_AUTO_DISCOVERY=false
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

echo Building Electron app...
echo.

call npx electron-builder --win --x64 --dir

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  BUILD SUCCESSFUL!
    echo ========================================================
    echo.
    echo The app is in: dist\win-unpacked\
    echo.
    echo To run: dist\win-unpacked\Tek Automator.exe
    echo.
) else (
    echo.
    echo ========================================================
    echo  BUILD FAILED!
    echo ========================================================
    echo.
)

pause
