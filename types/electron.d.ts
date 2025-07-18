// types/electron.d.ts
export interface ElectronAPI {
  getAppVersion: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
