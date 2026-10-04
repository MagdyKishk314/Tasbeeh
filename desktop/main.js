// Electron shell for the Tasbeeh app. It shows the Expo web export (./web) in a phone-sized window.
const { app, BrowserWindow, Menu, net, protocol } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const WEB_DIR = path.join(__dirname, 'web');

// The web export uses absolute URLs (/_expo/...), which break under file://, so it is served
// from a custom origin instead. "standard" + "secure" also give it working localStorage.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function serveWebExport(request) {
  const { pathname } = new URL(request.url);
  let file = path.normalize(path.join(WEB_DIR, decodeURIComponent(pathname)));
  if (!file.startsWith(WEB_DIR)) return new Response('Not found', { status: 404 });
  // Anything that is not a file request is an app route: serve the single-page app.
  if (!path.extname(file)) file = path.join(WEB_DIR, 'index.html');
  return net.fetch(pathToFileURL(file).toString());
}

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    title: 'Tasbeeh',
    backgroundColor: '#0E1B17',
  });
  // Dark scrollbars to match the app's theme.
  win.webContents.on('did-finish-load', () => win.webContents.insertCSS(':root { color-scheme: dark; }'));
  win.loadURL('app://tasbeeh/');
}

// A second launch focuses the existing window rather than opening another copy on the same data.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    protocol.handle('app', serveWebExport);
    createWindow();
  });

  app.on('window-all-closed', () => app.quit());
}
