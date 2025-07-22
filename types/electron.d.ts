// types/electron.d.ts (updated)
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  selectFolder: () => Promise<string | null>
  getProjectFiles: (folderPath: string) => Promise<string[]>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
