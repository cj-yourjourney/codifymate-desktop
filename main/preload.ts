// main/preload.ts (updated with new methods)
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

  // Updated token methods with new optional features:
  storeToken: (key: string, value: string) =>
    ipcRenderer.invoke('store-token', key, value),
  getToken: (key: string) => ipcRenderer.invoke('get-token', key),
  removeToken: (key: string) => ipcRenderer.invoke('remove-token', key),
  clearAllTokens: () => ipcRenderer.invoke('clear-all-tokens'),

  // New optional token utility methods:
  isTokenValid: (key: string) => ipcRenderer.invoke('is-token-valid', key),
  extendTokenExpiry: (key: string) =>
    ipcRenderer.invoke('extend-token-expiry', key)
})
