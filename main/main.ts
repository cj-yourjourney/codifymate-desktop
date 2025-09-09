//  main.ts - Main entry point (updated)
import { app, BrowserWindow, protocol } from 'electron'
import { setupAutoUpdater } from './services/auto-updater'
import { setupMenu } from './services/menu'
import { setupIpcHandlers } from './services/ipc-handlers'
import { initializeTokenStore } from './services/token-storage'
import { isDev } from './util'
import * as path from 'path'

if (require('electron-squirrel-startup')) {
  app.quit()
}

// Initialize services
setupAutoUpdater()
initializeTokenStore()

const createWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    }
  })

  // Setup menu and context menu
  setupMenu(mainWindow)

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../out/index.html')
    console.log('Loading file from:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  return mainWindow
}

app.whenReady().then(() => {
  // Register file protocol for production
  if (!isDev) {
    protocol.registerFileProtocol('file', (request, callback) => {
      const pathname = decodeURI(request.url.replace('file:///', ''))
      callback(pathname)
    })
  }

  createWindow()
  setupIpcHandlers()

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
