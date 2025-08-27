// services/file-operations.ts - File operations service
import { dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

const RELEVANT_EXTENSIONS = [
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

const IGNORED_DIRECTORIES = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '__pycache__'
]

export function getAllFilePaths(
  dirPath: string,
  fileList: string[] = []
): string[] {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (!IGNORED_DIRECTORIES.includes(file)) {
        getAllFilePaths(filePath, fileList)
      }
    } else {
      const ext = path.extname(file).toLowerCase()
      if (RELEVANT_EXTENSIONS.includes(ext)) {
        fileList.push(filePath)
      }
    }
  })

  return fileList
}

export async function selectFolder(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }

  return null
}

export async function selectFiles(): Promise<string[]> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Code Files',
        extensions: RELEVANT_EXTENSIONS.map((ext) => ext.substring(1)) // Remove the dot
      },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths.map((filePath) => path.resolve(filePath))
  }

  return []
}

export async function readFileContent(filePath: string): Promise<string> {
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

  return fs.readFileSync(filePath, 'utf8')
}

export async function getProjectFiles(folderPath: string): Promise<string[]> {
  if (!folderPath || !fs.existsSync(folderPath)) {
    throw new Error('Invalid folder path')
  }

  const stat = fs.statSync(folderPath)
  if (!stat.isDirectory()) {
    throw new Error('Path is not a directory')
  }

  const filePaths = getAllFilePaths(folderPath)
  return filePaths.map((filePath) => path.resolve(filePath))
}

export async function writeFile(
  filePath: string,
  content: string
): Promise<boolean> {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(filePath, content, 'utf8')
  return true
}
