const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile(path.join(__dirname, 'out/index.html')); // For static export
  // win.loadURL('http://localhost:3000'); // For dev mode
}

app.on('ready', createWindow);
