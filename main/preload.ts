// main/preload.ts (updated)
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  getProjectFiles: (folderPath: string) =>
    ipcRenderer.invoke('get-project-files', folderPath),
  readFileContent: (filePath: string) =>
    ipcRenderer.invoke('read-file-content', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file', filePath, content),

  // Add these new token methods:
  storeToken: (key: string, value: string) =>
    ipcRenderer.invoke('store-token', key, value),
  getToken: (key: string) => ipcRenderer.invoke('get-token', key),
  removeToken: (key: string) => ipcRenderer.invoke('remove-token', key),
  clearAllTokens: () => ipcRenderer.invoke('clear-all-tokens')
})
