@echo off
echo Testing SERVE.bat generation...
echo.

REM Create a test serve script
(
echo @echo off
echo color 0B
echo title Tek Automator - Production Server
echo echo.
echo echo ========================================================
echo echo  Tek Automator - Production Server
echo echo ========================================================
echo echo.
echo echo Node.js found!
echo node --version
echo echo.
echo echo Build folder found.
echo echo.
echo echo Starting server...
echo echo.
echo pause
) > TEST_SERVE_OUTPUT.bat

echo.
echo Generated TEST_SERVE_OUTPUT.bat
echo.
echo Contents:
echo ========================================
type TEST_SERVE_OUTPUT.bat
echo ========================================
echo.
echo Now try running TEST_SERVE_OUTPUT.bat to see if it works without errors.
pause
