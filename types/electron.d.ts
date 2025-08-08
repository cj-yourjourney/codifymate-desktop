// types/electron.d.ts (updated)
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  selectFolder: () => Promise<string | null>
  selectFiles: () => Promise<string[]>
  getProjectFiles: (folderPath: string) => Promise<string[]>
  readFileContent: (filePath: string) => Promise<string>
  writeFile: (filePath: string, content: string) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
