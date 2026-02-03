const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Use app.isPackaged instead of electron-is-dev
const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false  // Allow loading local files
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from file system
    const indexPath = path.join(__dirname, '../build/index.html');
    mainWindow.loadFile(indexPath);
    
    // Optional: Open DevTools to debug
    // mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Intercept file protocol to handle fetch requests
  protocol.interceptFileProtocol('file', (request, callback) => {
    const requestedUrl = request.url.substr(7); // Remove 'file://' prefix
    
    // If it's a request for commands, templates, or other assets
    if (requestedUrl.includes('/commands/') || 
        requestedUrl.includes('/templates/') || 
        requestedUrl.includes('/manual/') ||
        requestedUrl.includes('/mascot/')) {
      
      // Extract the path after build/
      const relativePath = requestedUrl.split('/build/')[1] || requestedUrl;
      const filePath = path.join(__dirname, '../build', relativePath);
      
      callback({ path: filePath });
    } else {
      // Default file handling
      callback({ path: path.normalize(requestedUrl) });
    }
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
