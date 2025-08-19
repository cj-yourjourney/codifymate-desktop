// main/main.ts (updated with file system handling)
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

const tokenStore = new Map<string, Buffer>()



const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
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
ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
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
})


// Handle token storage
ipcMain.handle('store-token', async (event, key: string, value: string) => {
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value);
      tokenStore.set(key, encrypted);
    } else {
      // Fallback for systems without encryption
      console.warn('Encryption not available, storing token in plain text');
      tokenStore.set(key, Buffer.from(value, 'utf8'));
    }
  } catch (error) {
    console.error('Failed to store token:', error);
    throw error;
  }
});

// Handle token retrieval
ipcMain.handle('get-token', async (event, key: string): Promise<string | null> => {
  try {
    const encrypted = tokenStore.get(key);
    if (!encrypted) return null;

    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(encrypted);
    } else {
      return encrypted.toString('utf8');
    }
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
});

// Handle token removal
ipcMain.handle('remove-token', async (event, key: string) => {
  try {
    tokenStore.delete(key);
  } catch (error) {
    console.error('Failed to remove token:', error);
    throw error;
  }
});

// Handle clearing all tokens
ipcMain.handle('clear-all-tokens', async (event) => {
  try {
    tokenStore.clear();
  } catch (error) {
    console.error('Failed to clear tokens:', error);
    throw error;
  }
});