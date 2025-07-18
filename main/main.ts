import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import * as path from 'path'
import { isDev } from './util'

if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Allow local file access
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // Load the index.html from the out directory
    const indexPath = path.join(__dirname, '../out/index.html')
    console.log('Loading file from:', indexPath)

    // Use file:// protocol directly
    mainWindow.loadFile(indexPath)
  }
}

app.whenReady().then(() => {
  // Register file protocol handler for better asset loading
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Example IPC handler
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})
