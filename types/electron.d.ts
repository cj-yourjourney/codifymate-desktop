// types/electron.d.ts (updated)
export interface ElectronAPI {
  // Your existing methods
  getAppVersion: () => Promise<string>
  selectFolder: () => Promise<string | null>
  selectFiles: () => Promise<string[]>
  getProjectFiles: (folderPath: string) => Promise<string[]>
  readFileContent: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>

  // Updated token storage methods
  storeToken: (key: string, value: string) => Promise<void>
  getToken: (key: string) => Promise<string | null>
  removeToken: (key: string) => Promise<void>
  clearAllTokens: () => Promise<void>

  // New optional token utility methods
  isTokenValid: (key: string) => Promise<boolean>
  extendTokenExpiry: (key: string) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
