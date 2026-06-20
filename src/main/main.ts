import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, globalShortcut, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const dataPath = path.join(app.getPath('userData'), 'gravity-tasks.json');

function createTray() {
  // Base64 transparent placeholder icon
  const iconBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZ0lEQVQ4T2NkoBAwUqifAcVkhhkYGBh+/2f4jxMHJqAGwMRxGUASx2UASYbCxHEYQJKlcBgAUky25TCAGEM2jN4CYky24TCAWEPUjWAGYEu2oW4EMwBbssVgAC7NhgMYyK7FwMBArzAEAQC5Lxt7yYk43wAAAABJRU5ErkJggg==',
    'base64'
  );
  
  const iconPath = path.join(__dirname, '../../resources/icon.ico');
  const trayIcon = fs.existsSync(iconPath) 
    ? nativeImage.createFromPath(iconPath) 
    : nativeImage.createFromBuffer(iconBuffer);

  tray = new Tray(trayIcon);
  tray.setToolTip('Gravity Task Manager');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar Aplicación',
      click: () => {
        mainWindow?.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    mainWindow?.show();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false, // Frameless window
    backgroundColor: '#0a0b0d', // Match dark background
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Open DevTools by default to debug load failure
  // mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
    return false;
  });

  mainWindow.on('minimize', () => {
    mainWindow?.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handling for local storage persistence
ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Error loading local tasks:', error);
  }
  return null;
});

ipcMain.handle('save-data', async (event, data) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving local tasks:', error);
    return false;
  }
});

ipcMain.on('open-external', (event, url) => {
  try {
    shell.openExternal(url);
  } catch (err) {
    console.error('Failed to open external url:', url, err);
  }
});

// IPC Handling for window controls
ipcMain.on('window-minimize', () => {
  mainWindow?.hide();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  // Hide window and keep in tray
  mainWindow?.hide();
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register a global shortcut (Ctrl+Shift+T) to toggle window visibility
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
