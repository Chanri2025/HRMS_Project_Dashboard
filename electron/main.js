// electron/main.js
import {app, BrowserWindow} from "electron";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

function createWindow() {
    // 👇 resolve icon for dev & prod
    const iconPath = isDev
        ? path.join(process.cwd(), "public", "icon.png")   // during `npm run dev`
        : path.join(app.getAppPath(), "dist", "icon.png"); // inside asar after build
    // NOTE: Vite copies `public/*` to `dist/` on build, so icon.png ends up in dist.

    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // 🚫 Remove menu bar completely
    win.setMenuBarVisibility(false);
    win.setMenu(null);

    if (isDev) {
        win.loadURL("http://localhost:8080");
        win.webContents.openDevTools();
    } else {
        const appPath = app.getAppPath();
        const indexPath = path.join(appPath, "dist", "index.html");
        win.loadFile(indexPath);
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
