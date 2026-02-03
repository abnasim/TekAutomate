#!/bin/bash

echo "========================================================"
echo "  TekAutomate"
echo "========================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "WARNING: Dependencies not installed!"
    echo ""
    echo "Please run ./setup.sh first to install dependencies."
    echo ""
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "https://nodejs.org/dist/v24.13.0/node-v24.13.0.pkg"
    echo ""
    exit 1
fi

echo "Starting development server..."
echo ""
echo "The application will open in your browser at:"
echo "http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "========================================================"
echo ""

# Start the development server
npm start
