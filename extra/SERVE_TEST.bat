@echo off
color 0B
title Tek Automator - TEST Production Server
echo.
echo ========================================================
echo  Tek Automator - TEST Production Server  
echo ========================================================
echo.
echo This is a TEST version - will NOT open browser
echo Just testing if the server starts correctly
echo.
echo ========================================================
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
echo.

REM Check if build folder exists
if not exist "build" (
    color 0C
    echo [ERROR] build folder not found!
    echo.
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

echo [OK] Build folder found
echo.

REM Check if serve is installed
where npx >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] npx not found!
    echo.
    pause
    exit /b 1
)

echo [OK] npx found
echo.
echo ========================================================
echo  INSTALLING 'serve' package (if needed)...
echo ========================================================
echo.
call npm install -g serve

echo.
echo ========================================================
echo  READY TO START SERVER
echo ========================================================
echo.
echo Press Ctrl+C at any time to stop the server.
echo.
echo NOTE: Browser will NOT auto-open in test mode
echo       Manually open: http://localhost:3000
echo.
pause

echo.
echo Starting server...
echo.

REM Start the server (this blocks until Ctrl+C)
npx serve -s build -l 3000

echo.
echo Server stopped.
pause
