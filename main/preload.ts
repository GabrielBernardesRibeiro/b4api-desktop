import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  on: (channel: any, callback: any) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel: any, args: any) => {
    ipcRenderer.send(channel, args);
  },
  invoke: (channel: any, args?: any) => {
    return ipcRenderer.invoke(channel, args);
  },
});
