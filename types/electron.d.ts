export interface ElectronAPI {
  // Existing methods
  getAppVersion: () => Promise<string>
  selectFolder: () => Promise<string | null>
  selectFiles: () => Promise<string[]>
  getProjectFiles: (folderPath: string) => Promise<string[]>
  readFileContent: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>

  // Token storage methods
  storeToken: (key: string, value: string) => Promise<void>
  getToken: (key: string) => Promise<string | null>
  removeToken: (key: string) => Promise<void>
  clearAllTokens: () => Promise<void>
  isTokenValid: (key: string) => Promise<boolean>
  extendTokenExpiry: (key: string) => Promise<boolean>

  // Auto-updater method
  checkForUpdates: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
