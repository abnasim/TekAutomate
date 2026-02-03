#!/bin/bash

# Suppress Node.js deprecation warnings
export NODE_NO_WARNINGS=1

echo "========================================================"
echo "  TekAutomate - Production Server"
echo "========================================================"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from:"
    echo "https://nodejs.org/dist/v24.13.0/node-v24.13.0.pkg"
    exit 1
fi

# Check if build folder exists
if [ ! -f "build/index.html" ]; then
    echo "ERROR: Build folder not found!"
    echo ""
    echo "This distribution requires the build folder."
    exit 1
fi

# Check if port 3000 is in use
if lsof -i:3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: Port 3000 is already in use!"
    echo ""
    echo "Either:"
    echo "  1. Close the other application using port 3000"
    echo "  2. Or the app is already running at http://localhost:3000"
    echo ""
    echo "Opening browser..."
    open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null
    exit 0
fi

echo "Starting server..."
echo ""
echo "The application will be available at:"
echo ""
echo "   http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================================"
echo ""

# Use --single for SPA routing, force port 3000 (will fail if taken)
npx serve build -l 3000 --single --no-port-switching
