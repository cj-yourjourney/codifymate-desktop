// main/preload.ts (updated)
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getProjectFiles: (folderPath: string) =>
    ipcRenderer.invoke('get-project-files', folderPath)
})


