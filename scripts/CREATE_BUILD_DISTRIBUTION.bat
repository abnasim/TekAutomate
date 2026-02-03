@echo off
color 0B
title TekAutomate - Create Build Distribution
echo ========================================================
echo  TekAutomate - Create Build Distribution
echo ========================================================
echo.
echo This creates a MINIMAL distribution with just the
echo pre-built app. Users only need Node.js to run it.
echo.
echo NO npm install required - just run serve-only.bat
echo.

REM Change to project root directory
cd /d "%~dp0.."

REM Check if build folder exists
if not exist "build\index.html" (
    color 0E
    echo Build folder not found. Building now...
    echo.
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo BUILD FAILED!
        pause
        exit /b 1
    )
)

set ZIPNAME=TekAutomate_v2.0.4_prebuilt.zip

REM Remove old ZIP if exists
if exist "%ZIPNAME%" (
    echo Removing old ZIP file...
    del /Q "%ZIPNAME%"
)

echo.
echo Creating minimal distribution ZIP...
echo.

REM Use PowerShell to create ZIP
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'Stop'; " ^
    "$zipPath = Join-Path '%CD%' '%ZIPNAME%'; " ^
    "try { " ^
    "  Write-Host 'Adding files to ZIP...'; " ^
    "  $tempZip = $zipPath + '.tmp'; " ^
    "  if (Test-Path $tempZip) { Remove-Item $tempZip -Force }; " ^
    "  Add-Type -AssemblyName System.IO.Compression.FileSystem; " ^
    "  $zip = [System.IO.Compression.ZipFile]::Open($tempZip, 'Create'); " ^
    "  " ^
    "  # Add build folder " ^
    "  $buildFiles = Get-ChildItem -Path 'build' -Recurse -File; " ^
    "  foreach ($file in $buildFiles) { " ^
    "    $relPath = 'build/' + $file.FullName.Substring((Get-Item 'build').FullName.Length + 1).Replace('\', '/'); " ^
    "    $entry = $zip.CreateEntry($relPath); " ^
    "    $entryStream = $entry.Open(); " ^
    "    $fileStream = [System.IO.File]::OpenRead($file.FullName); " ^
    "    $fileStream.CopyTo($entryStream); " ^
    "    $fileStream.Close(); " ^
    "    $entryStream.Close(); " ^
    "  }; " ^
    "  Write-Host \"  Added $($buildFiles.Count) files from build/\"; " ^
    "  " ^
    "  # Add serve scripts " ^
    "  foreach ($script in @('serve-only.bat', 'serve-only.sh', 'README.md')) { " ^
    "    if (Test-Path $script) { " ^
    "      $entry = $zip.CreateEntry($script); " ^
    "      $entryStream = $entry.Open(); " ^
    "      $fileStream = [System.IO.File]::OpenRead($script); " ^
    "      $fileStream.CopyTo($entryStream); " ^
    "      $fileStream.Close(); " ^
    "      $entryStream.Close(); " ^
    "      Write-Host \"  Added $script\"; " ^
    "    } " ^
    "  }; " ^
    "  " ^
    "  $zip.Dispose(); " ^
    "  Move-Item $tempZip $zipPath -Force; " ^
    "  $sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2); " ^
    "  Write-Host ''; " ^
    "  Write-Host '========================================================'; " ^
    "  Write-Host '  SUCCESS!'; " ^
    "  Write-Host '========================================================'; " ^
    "  Write-Host ''; " ^
    "  Write-Host \"Created: $zipPath\"; " ^
    "  Write-Host \"Size: $sizeMB MB\"; " ^
    "  Write-Host ''; " ^
    "  Write-Host 'This ZIP contains:'; " ^
    "  Write-Host '  - build/ folder (pre-compiled app)'; " ^
    "  Write-Host '  - serve-only.bat (Windows)'; " ^
    "  Write-Host '  - serve-only.sh (macOS)'; " ^
    "  Write-Host '  - README.md'; " ^
    "  Write-Host ''; " ^
    "  Write-Host 'Users just need Node.js installed, then run serve-only.bat'; " ^
    "  exit 0 " ^
    "} catch { " ^
    "  Write-Host 'ERROR: ' $_.Exception.Message; " ^
    "  exit 1 " ^
    "}"

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo Done!
) else (
    color 0C
    echo.
    echo Failed to create ZIP.
)

pause
