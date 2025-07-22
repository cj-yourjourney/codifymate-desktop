// main/main.ts (updated with file system handling)
import { app, BrowserWindow, ipcMain, protocol, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
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

// New handler for selecting individual files
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
    return result.filePaths
  }

  return []
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
    return filePaths
  } catch (error) {
    console.error('Error getting project files:', error)
    throw error
  }
})
