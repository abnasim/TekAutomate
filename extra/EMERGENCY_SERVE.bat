@echo off
REM Emergency SERVE.bat - Copy this to your production build folder if needed
title Tek Automator
echo.
echo Tek Automator - Starting...
echo.

if not exist "build" (
    echo ERROR: This must be run from the folder containing build/
    echo Current location: %CD%
    pause
    exit /b 1
)

echo Installing serve package globally...
call npm install -g serve

echo.
echo Starting server at http://localhost:3000
echo Open your browser to that address
echo.
echo Press Ctrl+C to stop
echo.

call npx serve -s build -l 3000

echo.
echo Server stopped
pause
