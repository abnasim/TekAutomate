@echo off
color 0B
title TekAutomate
echo ========================================================
echo  TekAutomate
echo ========================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    color 0E
    echo WARNING: Dependencies not installed!
    echo.
    echo Please run SETUP.bat first to install dependencies.
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ERROR: Node.js is not installed!
    echo.
    echo Please run SETUP.bat first to install Node.js.
    echo.
    pause
    exit /b 1
)

echo Starting development server...
echo.
echo The application will open in your browser at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================================
echo.

REM Start the development server
call npm start

REM If we get here, the server was stopped
echo.
echo Server stopped.
pause
