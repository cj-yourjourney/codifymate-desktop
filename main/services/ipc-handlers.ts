// services/ipc-handlers.ts - IPC handlers service
import { ipcMain, app } from 'electron'
import { autoUpdater } from './auto-updater'
import { isDev } from '../util'
import {
  storeToken,
  getToken,
  removeToken,
  clearAllTokens,
  isTokenValid,
  extendTokenExpiry
} from './token-storage'
import {
  selectFolder,
  selectFiles,
  readFileContent,
  getProjectFiles,
  writeFile
} from './file-operations'

export function setupIpcHandlers() {
  // Auto-updater handlers
  ipcMain.handle('check-for-updates', () => {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify()
    }
  })

  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // File operation handlers
  ipcMain.handle('select-folder', async () => {
    try {
      return await selectFolder()
    } catch (error) {
      console.error('Error selecting folder:', error)
      throw error
    }
  })

  ipcMain.handle('select-files', async () => {
    try {
      return await selectFiles()
    } catch (error) {
      console.error('Error selecting files:', error)
      throw error
    }
  })

  ipcMain.handle('read-file-content', async (event, filePath: string) => {
    try {
      return await readFileContent(filePath)
    } catch (error) {
      console.error('Error reading file:', error)
      throw error
    }
  })

  ipcMain.handle('get-project-files', async (event, folderPath: string) => {
    try {
      return await getProjectFiles(folderPath)
    } catch (error) {
      console.error('Error getting project files:', error)
      throw error
    }
  })

  ipcMain.handle(
    'write-file',
    async (event, filePath: string, content: string) => {
      try {
        return await writeFile(filePath, content)
      } catch (error) {
        console.error('Error writing file:', error)
        throw error
      }
    }
  )

  // Token storage handlers
  ipcMain.handle('store-token', async (event, key: string, value: string) => {
    return await storeToken(key, value)
  })

  ipcMain.handle('get-token', async (event, key: string) => {
    return await getToken(key)
  })

  ipcMain.handle('remove-token', async (event, key: string) => {
    return await removeToken(key)
  })

  ipcMain.handle('clear-all-tokens', async () => {
    return await clearAllTokens()
  })

  ipcMain.handle('is-token-valid', async (event, key: string) => {
    return await isTokenValid(key)
  })

  ipcMain.handle('extend-token-expiry', async (event, key: string) => {
    return await extendTokenExpiry(key)
  })
}
