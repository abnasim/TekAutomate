@echo off
color 0B
title TekAutomate

REM Suppress Node.js deprecation warnings
set NODE_NO_WARNINGS=1

echo ========================================================
echo  TekAutomate - Production Server
echo ========================================================
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from:
    echo https://nodejs.org/dist/v24.13.0/node-v24.13.0-x64.msi
    echo.
    pause
    exit /b 1
)

REM Check if build folder exists
if not exist "build\index.html" (
    color 0C
    echo ERROR: Build folder not found!
    echo.
    echo This distribution requires the build folder.
    pause
    exit /b 1
)

echo Starting server...
echo.
echo The application will be available at:
echo.
echo    http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================================
echo.

npx serve build -l 3000

echo.
echo Server stopped.
pause
