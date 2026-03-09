const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow;
let splashWindow;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 360,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: Math.min(1400, width),
    height: Math.min(900, height),
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      mainWindow.show();
      mainWindow.focus();
    }, 1500);
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // --- Offline detection & sync banner ---
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        function showBanner(msg, color) {
          let el = document.getElementById('electron-offline-banner');
          if (!el) {
            el = document.createElement('div');
            el.id = 'electron-offline-banner';
            el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:6px 16px;text-align:center;font-size:13px;font-weight:600;transition:all .3s;';
            document.body.prepend(el);
          }
          el.textContent = msg;
          el.style.background = color;
          el.style.color = '#fff';
          el.style.display = 'block';
        }
        function hideBanner() {
          const el = document.getElementById('electron-offline-banner');
          if (el) el.style.display = 'none';
        }
        window.addEventListener('offline', () => showBanner('⚠ Mode hors-ligne — Les modifications seront synchronisées automatiquement.', '#d97706'));
        window.addEventListener('online', () => {
          showBanner('✅ Connexion rétablie — Synchronisation en cours...', '#16a34a');
          setTimeout(hideBanner, 3000);
        });
        if (!navigator.onLine) showBanner('⚠ Mode hors-ligne', '#d97706');
      })();
    `);
  });
}

app.whenReady().then(() => {
  createSplashWindow();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createMainWindow();
});
