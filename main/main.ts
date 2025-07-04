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
        currentVersion, // << ADICIONADO AQUI
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
      currentVersion: autoUpdater.currentVersion.version,
      notes: "result of checkForUpdates is null",
    };
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    return {
      available: false,
      version: autoUpdater.currentVersion.version,
      currentVersion: autoUpdater.currentVersion.version,
      notes: "",
    };
  }
});
// Iniciar o download da atualização
ipcMain.on("start-update", () => {
  try {
    console.log("Iniciando download da atualização...");
    autoUpdater.downloadUpdate();
  } catch (error) {
    console.error("Erro ao iniciar atualização:", error);
    mainWindow?.webContents.send("update-error", error.message);
  }
});

// Evento chamado quando a atualização está disponível
autoUpdater.on("update-available", () => {
  console.log("Atualização disponível, baixando...");
  // autoUpdater.downloadUpdate(); ← já é feito em "start-update", evite duplicar
});

// Evento chamado quando o download é concluído
autoUpdater.on("update-downloaded", () => {
  console.log("Atualização baixada.");
  mainWindow?.webContents.send("update-downloaded");
});

// Evento chamado se houver erro
autoUpdater.on("error", (error) => {
  console.error("Erro durante atualização:", error);
  mainWindow?.webContents.send("update-error", error.message);
});

// Instalar a atualização
ipcMain.on("install-update", () => {
  console.log("Instalando atualização...");
  autoUpdater.quitAndInstall(); // Isso reinicia o app automaticamente
});
