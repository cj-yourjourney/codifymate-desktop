import {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  dialog,
  safeStorage,
  Menu,
  shell
} from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as fs from 'fs'
import { isDev } from './util'

if (require('electron-squirrel-startup')) {
  app.quit()
}

// Configure auto-updater
autoUpdater.checkForUpdatesAndNotify()

// Auto-updater event listeners
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version)
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info.version)
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`
  logMessage += ` - Downloaded ${progressObj.percent}%`
  logMessage += ` (${progressObj.transferred}/${progressObj.total})`
  console.log(logMessage)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version)

  // Show dialog to user
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `A new version (${info.version}) has been downloaded. Restart the application to apply the update.`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

// Token storage configuration (keeping your existing code)
const TOKEN_STORAGE_FILE = path.join(app.getPath('userData'), 'tokens.json')
const TOKEN_EXPIRY_DAYS = 7

interface StoredToken {
  encryptedData: string
  expiresAt: number
}

interface TokenStorage {
  [key: string]: StoredToken
}

// Load tokens from disk on startup
function loadTokensFromDisk(): TokenStorage {
  try {
    if (fs.existsSync(TOKEN_STORAGE_FILE)) {
      const data = fs.readFileSync(TOKEN_STORAGE_FILE, 'utf8')
      const tokens: TokenStorage = JSON.parse(data)

      const now = Date.now()
      const validTokens: TokenStorage = {}

      for (const [key, token] of Object.entries(tokens)) {
        if (token.expiresAt > now) {
          validTokens[key] = token
        }
      }

      if (Object.keys(validTokens).length !== Object.keys(tokens).length) {
        saveTokensToDisk(validTokens)
      }

      return validTokens
    }
  } catch (error) {
    console.error('Failed to load tokens from disk:', error)
  }
  return {}
}

// Save tokens to disk
function saveTokensToDisk(tokens: TokenStorage): void {
  try {
    const dir = path.dirname(TOKEN_STORAGE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(
      TOKEN_STORAGE_FILE,
      JSON.stringify(tokens, null, 2),
      'utf8'
    )
  } catch (error) {
    console.error('Failed to save tokens to disk:', error)
  }
}

let tokenStore: TokenStorage = loadTokensFromDisk()

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now()
  const validTokens: TokenStorage = {}
  let hasExpiredTokens = false

  for (const [key, token] of Object.entries(tokenStore)) {
    if (token.expiresAt > now) {
      validTokens[key] = token
    } else {
      hasExpiredTokens = true
    }
  }

  if (hasExpiredTokens) {
    tokenStore = validTokens
    saveTokensToDisk(tokenStore)
    console.log('Cleaned up expired tokens')
  }
}, 60 * 60 * 1000)

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

  // Create comprehensive menu with copy/paste support
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    // macOS app menu
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'Select Folder',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            })
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send(
                'folder-selected',
                result.filePaths[0]
              )
            }
          }
        },
        {
          label: 'Select Files',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile', 'multiSelections'],
              filters: [
                {
                  name: 'Code Files',
                  extensions: [
                    'js',
                    'ts',
                    'jsx',
                    'tsx',
                    'py',
                    'java',
                    'cpp',
                    'c',
                    'h',
                    'css',
                    'scss',
                    'html',
                    'vue',
                    'php',
                    'rb',
                    'go',
                    'rs',
                    'swift',
                    'kt',
                    'dart',
                    'json',
                    'yml',
                    'yaml',
                    'xml',
                    'sql'
                  ]
                },
                { name: 'All Files', extensions: ['*'] }
              ]
            })
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('files-selected', result.filePaths)
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit menu (THIS IS THE KEY PART FOR COPY/PASTE)
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
        }
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const }
            ]
          : [])
      ]
    },

    // Help menu
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify()
          }
        },
        { type: 'separator' },
        {
          label: 'About CodifyMate',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About CodifyMate',
              message: `CodifyMate v${app.getVersion()}`,
              detail:
                'Built with Electron, Next.js, and ❤️\n\nKeyboard Shortcuts:\nCtrl/Cmd + C: Copy\nCtrl/Cmd + V: Paste\nCtrl/Cmd + A: Select All\nCtrl/Cmd + Z: Undo\nCtrl/Cmd + Y: Redo'
            })
          }
        },
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Enable right-click context menu with copy/paste
  mainWindow.webContents.on('context-menu', (event, params) => {
    const contextMenu = Menu.buildFromTemplate([
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ])
    contextMenu.popup()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../out/index.html')
    console.log('Loading file from:', indexPath)
    mainWindow.loadFile(indexPath)

    // Check for updates when app starts (only in production)
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify()
    }, 5000) // Wait 5 seconds after startup
  }

  return mainWindow
}

app.whenReady().then(() => {
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

// IPC Handlers for auto-updater
ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// Helper function to recursively get all file paths
function getAllFilePaths(dirPath: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (
        ![
          'node_modules',
          '.git',
          '.next',
          'dist',
          'build',
          '__pycache__'
        ].includes(file)
      ) {
        getAllFilePaths(filePath, fileList)
      }
    } else {
      const ext = path.extname(file).toLowerCase()
      const relevantExts = [
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.py',
        '.java',
        '.cpp',
        '.c',
        '.h',
        '.css',
        '.scss',
        '.html',
        '.vue',
        '.php',
        '.rb',
        '.go',
        '.rs',
        '.swift',
        '.kt',
        '.dart',
        '.json',
        '.yml',
        '.yaml',
        '.xml',
        '.sql'
      ]

      if (relevantExts.includes(ext)) {
        fileList.push(filePath)
      }
    }
  })

  return fileList
}

// Your existing IPC handlers (keeping all of them)
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }

  return null
})

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Code Files',
        extensions: [
          'js',
          'ts',
          'jsx',
          'tsx',
          'py',
          'java',
          'cpp',
          'c',
          'h',
          'css',
          'scss',
          'html',
          'vue',
          'php',
          'rb',
          'go',
          'rs',
          'swift',
          'kt',
          'dart',
          'json',
          'yml',
          'yaml',
          'xml',
          'sql'
        ]
      },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths.map((filePath) => path.resolve(filePath))
  }

  return []
})

ipcMain.handle('read-file-content', async (event, filePath: string) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('File does not exist')
    }

    const stat = fs.statSync(filePath)
    if (!stat.isFile()) {
      throw new Error('Path is not a file')
    }

    const maxFileSize = 10 * 1024 * 1024 // 10MB limit
    if (stat.size > maxFileSize) {
      throw new Error('File is too large to read (max 10MB)')
    }

    const content = fs.readFileSync(filePath, 'utf8')
    return content
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
})

ipcMain.handle('get-project-files', async (event, folderPath: string) => {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) {
      throw new Error('Invalid folder path')
    }

    const stat = fs.statSync(folderPath)
    if (!stat.isDirectory()) {
      throw new Error('Path is not a directory')
    }

    const filePaths = getAllFilePaths(folderPath)
    return filePaths.map((filePath) => path.resolve(filePath))
  } catch (error) {
    console.error('Error getting project files:', error)
    throw error
  }
})

ipcMain.handle(
  'write-file',
  async (event, filePath: string, content: string) => {
    try {
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(filePath, content, 'utf8')
      return true
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }
)

// Token storage handlers (keeping your existing implementation)
ipcMain.handle('store-token', async (event, key: string, value: string) => {
  try {
    let encryptedData: string

    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value)
      encryptedData = encrypted.toString('base64')
    } else {
      console.warn('Encryption not available, storing token encoded in base64')
      encryptedData = Buffer.from(value, 'utf8').toString('base64')
    }

    const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    tokenStore[key] = {
      encryptedData,
      expiresAt
    }

    saveTokensToDisk(tokenStore)

    console.log(
      `Token '${key}' stored successfully, expires at:`,
      new Date(expiresAt)
    )
  } catch (error) {
    console.error('Failed to store token:', error)
    throw error
  }
})

ipcMain.handle(
  'get-token',
  async (event, key: string): Promise<string | null> => {
    try {
      const storedToken = tokenStore[key]
      if (!storedToken) return null

      if (storedToken.expiresAt <= Date.now()) {
        console.log(`Token '${key}' has expired, removing it`)
        delete tokenStore[key]
        saveTokensToDisk(tokenStore)
        return null
      }

      if (safeStorage.isEncryptionAvailable()) {
        const encryptedBuffer = Buffer.from(storedToken.encryptedData, 'base64')
        return safeStorage.decryptString(encryptedBuffer)
      } else {
        return Buffer.from(storedToken.encryptedData, 'base64').toString('utf8')
      }
    } catch (error) {
      console.error('Failed to retrieve token:', error)
      return null
    }
  }
)

ipcMain.handle('remove-token', async (event, key: string) => {
  try {
    delete tokenStore[key]
    saveTokensToDisk(tokenStore)
    console.log(`Token '${key}' removed successfully`)
  } catch (error) {
    console.error('Failed to remove token:', error)
    throw error
  }
})

ipcMain.handle('clear-all-tokens', async (event) => {
  try {
    tokenStore = {}
    saveTokensToDisk(tokenStore)
    console.log('All tokens cleared successfully')
  } catch (error) {
    console.error('Failed to clear tokens:', error)
    throw error
  }
})

ipcMain.handle(
  'is-token-valid',
  async (event, key: string): Promise<boolean> => {
    try {
      const storedToken = tokenStore[key]
      if (!storedToken) return false

      const isValid = storedToken.expiresAt > Date.now()

      if (!isValid) {
        delete tokenStore[key]
        saveTokensToDisk(tokenStore)
      }

      return isValid
    } catch (error) {
      console.error('Failed to check token validity:', error)
      return false
    }
  }
)

ipcMain.handle(
  'extend-token-expiry',
  async (event, key: string): Promise<boolean> => {
    try {
      const storedToken = tokenStore[key]
      if (!storedToken) return false

      storedToken.expiresAt =
        Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      tokenStore[key] = storedToken
      saveTokensToDisk(tokenStore)

      console.log(
        `Token '${key}' expiration extended to:`,
        new Date(storedToken.expiresAt)
      )
      return true
    } catch (error) {
      console.error('Failed to extend token expiry:', error)
      return false
    }
  }
)
