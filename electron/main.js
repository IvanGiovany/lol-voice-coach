const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#020617",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // For dev: load your Next.js app
  mainWindow.loadURL("http://localhost:3000");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function registerShortcuts() {
  // Ctrl+Shift+L -> toggle listening
  globalShortcut.register("CommandOrControl+Shift+L", () => {
    if (mainWindow) {
      mainWindow.webContents.send("toggle-record");
    }
  });

  // Ctrl+Shift+K -> ask coach
  globalShortcut.register("CommandOrControl+Shift+K", () => {
    if (mainWindow) {
      mainWindow.webContents.send("ask-coach");
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  registerShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
