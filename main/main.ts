// main/main.ts (updated with persistent token storage)
import {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  dialog,
  safeStorage
} from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { isDev } from './util'

if (require('electron-squirrel-startup')) {
  app.quit()
}

// Token storage configuration
const TOKEN_STORAGE_FILE = path.join(app.getPath('userData'), 'tokens.json')
const TOKEN_EXPIRY_DAYS = 7 // Keep tokens for 7 days

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

      // Clean up expired tokens
      const now = Date.now()
      const validTokens: TokenStorage = {}

      for (const [key, token] of Object.entries(tokens)) {
        if (token.expiresAt > now) {
          validTokens[key] = token
        }
      }

      // Save cleaned tokens back to disk if any were removed
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
    // Ensure the directory exists
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

// Initialize token storage from disk
let tokenStore: TokenStorage = loadTokensFromDisk()

// Clean up expired tokens periodically (every hour)
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
}, 60 * 60 * 1000) // Run every hour

const createWindow = (): void => {
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

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '../out/index.html')
    console.log('Loading file from:', indexPath)
    mainWindow.loadFile(indexPath)
  }
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

// Helper function to recursively get all file paths
function getAllFilePaths(dirPath: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Skip common directories that shouldn't be included
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
      // Only include relevant file types
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

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }

  return null
})

// Updated handler for selecting individual files - returns absolute paths
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
    // Return absolute paths
    return result.filePaths.map((filePath) => path.resolve(filePath))
  }

  return []
})

// New handler to read file content
ipcMain.handle('read-file-content', async (event, filePath: string) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('File does not exist')
    }

    const stat = fs.statSync(filePath)
    if (!stat.isFile()) {
      throw new Error('Path is not a file')
    }

    // Check file size to prevent reading very large files
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
    // Return absolute paths
    return filePaths.map((filePath) => path.resolve(filePath))
  } catch (error) {
    console.error('Error getting project files:', error)
    throw error
  }
})

// Add this IPC handler to main.ts
ipcMain.handle(
  'write-file',
  async (event, filePath: string, content: string) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Write the file
      fs.writeFileSync(filePath, content, 'utf8')
      return true
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }
)

// Updated token storage handlers with persistence
ipcMain.handle('store-token', async (event, key: string, value: string) => {
  try {
    let encryptedData: string

    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value)
      encryptedData = encrypted.toString('base64')
    } else {
      // Fallback for systems without encryption
      console.warn('Encryption not available, storing token encoded in base64')
      encryptedData = Buffer.from(value, 'utf8').toString('base64')
    }

    // Calculate expiration time (7 days from now)
    const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    // Store in memory
    tokenStore[key] = {
      encryptedData,
      expiresAt
    }

    // Persist to disk
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

// Handle token retrieval with expiration check
ipcMain.handle(
  'get-token',
  async (event, key: string): Promise<string | null> => {
    try {
      const storedToken = tokenStore[key]
      if (!storedToken) return null

      // Check if token has expired
      if (storedToken.expiresAt <= Date.now()) {
        console.log(`Token '${key}' has expired, removing it`)
        delete tokenStore[key]
        saveTokensToDisk(tokenStore)
        return null
      }

      // Decrypt the token
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

// Handle token removal
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

// Handle clearing all tokens
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

// Optional: Add a method to check token expiration without retrieving the token
ipcMain.handle(
  'is-token-valid',
  async (event, key: string): Promise<boolean> => {
    try {
      const storedToken = tokenStore[key]
      if (!storedToken) return false

      const isValid = storedToken.expiresAt > Date.now()

      // Clean up expired token
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

// Optional: Add a method to extend token expiration
ipcMain.handle(
  'extend-token-expiry',
  async (event, key: string): Promise<boolean> => {
    try {
      const storedToken = tokenStore[key]
      if (!storedToken) return false

      // Extend expiration by another 7 days
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
