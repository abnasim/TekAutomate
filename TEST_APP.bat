@echo off
echo Testing Tek Automator...
echo.
echo Launching app from: dist\win-unpacked\
echo.

cd /d "%~dp0dist\win-unpacked"

if not exist "Tek Automator.exe" (
    echo ERROR: Tek Automator.exe not found!
    echo.
    echo Looking for: %CD%\Tek Automator.exe
    pause
    exit /b 1
)

echo Found: Tek Automator.exe
echo.
echo Launching...
echo.

start "" "Tek Automator.exe"

echo.
echo App should launch in a new window.
echo Check if commands load properly.
echo.
pause
