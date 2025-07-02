import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";

let mainWindow: BrowserWindow | null = null;

autoUpdater.autoDownload = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "..", "out", "index.html"));
  } else {
    mainWindow.loadURL("https://localhost:3000");

    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on("did-fail-load", () => {
      mainWindow?.webContents.reloadIgnoringCache();
    });
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("check-for-updates", async () => {
  try {
    const result = await autoUpdater.checkForUpdates();

    if (result) {
      const updateInfo = result.updateInfo;
      const currentVersion = autoUpdater.currentVersion.version;

      const isUpdateAvailable = updateInfo.version !== currentVersion;
      
      return {
        available: isUpdateAvailable,
        version: updateInfo.version,
        notes:
          typeof updateInfo.releaseNotes === "string"
            ? updateInfo.releaseNotes
            : Array.isArray(updateInfo.releaseNotes)
            ? updateInfo.releaseNotes.map((note) => note.note).join("\n")
            : "No release notes.",
      };
    }

    return {
      available: false,
      version: "undefined",
      notes: "result of checkForUpdates is null",
    };
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    return {
      available: false,
      version: autoUpdater.currentVersion.version,
      notes: "",
    };
  }
});

ipcMain.on("start-update", async () => {
  await autoUpdater.checkForUpdates();
});

autoUpdater.on("update-available", () => {
  autoUpdater.downloadUpdate();
});

autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update-downloaded");
});

ipcMain.on("install-update", () => {
  console.log("Instalando atualização...");
  autoUpdater.quitAndInstall();
});
