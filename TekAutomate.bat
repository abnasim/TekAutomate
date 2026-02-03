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

REM Check if port 3000 is in use
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    color 0E
    echo WARNING: Port 3000 is already in use!
    echo.
    echo Either:
    echo   1. Close the other application using port 3000
    echo   2. Or close this window and the app is already running
    echo.
    echo Opening browser to existing server...
    start http://localhost:3000
    echo.
    pause
    exit /b 0
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

REM Use --single for SPA routing, -l to force port (will fail if taken)
npx serve build -l 3000 --single --no-port-switching

echo.
echo Server stopped.
pause
