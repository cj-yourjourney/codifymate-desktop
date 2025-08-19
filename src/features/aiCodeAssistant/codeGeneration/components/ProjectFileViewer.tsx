import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import {
  FolderOpen,
  File,
  Eye,
  X,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  FileText,
  Code,
  Image,
  Archive,
  AlertCircle,
  Save,
  Edit3,
  Lock,
  Unlock,
  Plus,
  Minus,
  RotateCcw,
  ArrowLeft
} from 'lucide-react'

interface ProjectFile {
  path: string
  name: string
  size?: number
  extension: string
  type: 'file' | 'folder'
  children?: ProjectFile[]
  isExpanded?: boolean
}

interface ProjectFileViewerProps {
  selectedFolder?: string | null
  onFileSelect?: (filePath: string, fileName: string) => void
}

interface FileReference {
  file: ProjectFile
  isReference: boolean
  originalFile?: ProjectFile
}

const ProjectFileViewer: React.FC<ProjectFileViewerProps> = ({
  selectedFolder,
  onFileSelect
}) => {
  const [fileTree, setFileTree] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFileRef, setCurrentFileRef] = useState<FileReference | null>(
    null
  )
  const [fileContent, setFileContent] = useState<string>('')
  const [editedContent, setEditedContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savingFile, setSavingFile] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const editorRef = useRef<any>(null)

  // Load files when selectedFolder changes
  useEffect(() => {
    if (selectedFolder) {
      loadProjectFiles(selectedFolder)
    } else {
      setFileTree([])
    }
  }, [selectedFolder])

  // Build file tree structure from flat file paths
  const buildFileTree = (
    filePaths: string[],
    rootPath: string
  ): ProjectFile[] => {
    const tree: ProjectFile[] = []
    const pathMap = new Map<string, ProjectFile>()

    // First pass: create all folder nodes
    filePaths.forEach((filePath) => {
      const relativePath = filePath.replace(rootPath, '').replace(/^[/\\]/, '')
      const parts = relativePath.split(/[/\\]/)

      let currentPath = rootPath
      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i]
        const folderPath = currentPath + '/' + folderName

        if (!pathMap.has(folderPath)) {
          const folder: ProjectFile = {
            path: folderPath,
            name: folderName,
            type: 'folder',
            extension: '',
            children: [],
            isExpanded: false
          }
          pathMap.set(folderPath, folder)
        }
        currentPath = folderPath
      }
    })

    // Second pass: create file nodes and build hierarchy
    filePaths.forEach((filePath) => {
      const fileName = filePath.split(/[/\\]/).pop() || 'unknown'
      const extension = fileName.split('.').pop()?.toLowerCase() || ''

      const file: ProjectFile = {
        path: filePath,
        name: fileName,
        type: 'file',
        extension
      }

      const relativePath = filePath.replace(rootPath, '').replace(/^[/\\]/, '')
      const parts = relativePath.split(/[/\\]/)

      if (parts.length === 1) {
        tree.push(file)
      } else {
        const parentFolderPath = rootPath + '/' + parts.slice(0, -1).join('/')
        const parentFolder = pathMap.get(parentFolderPath)
        if (parentFolder && parentFolder.children) {
          parentFolder.children.push(file)
        }
      }
    })

    // Third pass: add folders to tree in correct hierarchy
    Array.from(pathMap.values()).forEach((folder) => {
      const relativePath = folder.path
        .replace(rootPath, '')
        .replace(/^[/\\]/, '')
      const parts = relativePath.split(/[/\\]/)

      if (parts.length === 1) {
        tree.push(folder)
      } else {
        const parentFolderPath = rootPath + '/' + parts.slice(0, -1).join('/')
        const parentFolder = pathMap.get(parentFolderPath)
        if (parentFolder && parentFolder.children) {
          parentFolder.children.push(folder)
        }
      }
    })

    const sortItems = (items: ProjectFile[]): ProjectFile[] => {
      return items
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
        .map((item) => {
          if (item.children) {
            item.children = sortItems(item.children)
          }
          return item
        })
    }

    return sortItems(tree)
  }

  const loadProjectFiles = async (folderPath: string) => {
    setLoading(true)
    setError(null)
    try {
      const filePaths = await window.electronAPI.getProjectFiles(folderPath)
      const tree = buildFileTree(filePaths, folderPath)
      setFileTree(tree)
    } catch (err) {
      console.error('Error loading project files:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to load project files'
      )
    } finally {
      setLoading(false)
    }
  }

  // Find file by name in the file tree
  const findFileByName = (
    fileName: string,
    items: ProjectFile[] = fileTree
  ): ProjectFile | null => {
    for (const item of items) {
      if (item.type === 'file' && item.name === fileName) {
        return item
      }
      if (item.children) {
        const found = findFileByName(fileName, item.children)
        if (found) return found
      }
    }
    return null
  }

  // Find file by relative path
  const findFileByPath = (
    relativePath: string,
    currentFilePath: string,
    items: ProjectFile[] = fileTree
  ): ProjectFile | null => {
    const currentDir = currentFilePath.substring(
      0,
      currentFilePath.lastIndexOf('/')
    )
    let targetPath = ''

    if (relativePath.startsWith('./')) {
      targetPath = currentDir + '/' + relativePath.substring(2)
    } else if (relativePath.startsWith('../')) {
      const upLevels = (relativePath.match(/\.\.\//g) || []).length
      const pathParts = currentDir.split('/')
      const newPath = pathParts.slice(0, -upLevels).join('/')
      const remainingPath = relativePath.replace(/\.\.\//g, '')
      targetPath = newPath + '/' + remainingPath
    } else {
      // Try to find by filename in the same directory first
      const fileName = relativePath.split('/').pop()
      if (fileName) {
        const found = findFileByName(fileName, items)
        if (found) return found
      }
    }

    // Normalize the target path and find the file
    const normalizedPath = targetPath.replace(/\/+/g, '/').replace(/\/$/, '')

    const findByPath = (items: ProjectFile[]): ProjectFile | null => {
      for (const item of items) {
        if (item.type === 'file' && item.path === normalizedPath) {
          return item
        }
        if (item.children) {
          const found = findByPath(item.children)
          if (found) return found
        }
      }
      return null
    }

    return findByPath(items)
  }

  // Extract references from file content
  const extractReferences = (content: string, currentFile: ProjectFile) => {
    const references: {
      text: string
      startLine: number
      startCol: number
      endLine: number
      endCol: number
      type: 'path' | 'name'
      associatedPath?: string
    }[] = []
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      // Match import statements with both names and paths
      const importPatterns = [
        // import Name from 'path'
        /import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
        // import { Name1, Name2 } from 'path'
        /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"`]([^'"`]+)['"`]/g,
        // import * as Name from 'path'
        /import\s+\*\s+as\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
        // import Name, { Other } from 'path'
        /import\s+(\w+)\s*,\s*\{[^}]*\}\s+from\s+['"`]([^'"`]+)['"`]/g,
        // const Name = require('path')
        /const\s+(\w+)\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        // import 'path' (side effect imports)
        /import\s+['"`]([^'"`]+)['"`]/g
      ]

      importPatterns.forEach((pattern) => {
        let match
        while ((match = pattern.exec(line)) !== null) {
          const fullMatch = match[0]
          const startCol = match.index || 0

          // Handle different import patterns
          if (pattern.source.includes('import\\s+[\'"`]')) {
            // Side effect import: import 'path'
            const importPath = match[1]
            if (
              importPath &&
              (importPath.startsWith('./') ||
                importPath.startsWith('../') ||
                !importPath.includes('/'))
            ) {
              references.push({
                text: importPath,
                startLine: lineIndex,
                startCol: startCol + fullMatch.indexOf(importPath),
                endLine: lineIndex,
                endCol:
                  startCol + fullMatch.indexOf(importPath) + importPath.length,
                type: 'path'
              })
            }
          } else {
            // Regular imports with names and paths
            const importName = match[1]
            const importPath = match[2]

            // Add path reference
            if (
              importPath &&
              (importPath.startsWith('./') ||
                importPath.startsWith('../') ||
                !importPath.includes('/'))
            ) {
              const pathStart =
                startCol + fullMatch.indexOf(`'${importPath}'`) + 1 ||
                startCol + fullMatch.indexOf(`"${importPath}"`) + 1 ||
                startCol + fullMatch.indexOf(`\`${importPath}\``) + 1

              references.push({
                text: importPath,
                startLine: lineIndex,
                startCol: pathStart,
                endLine: lineIndex,
                endCol: pathStart + importPath.length,
                type: 'path'
              })

              // Add name reference(s)
              if (importName) {
                if (importName.includes(',') || importName.includes('{')) {
                  // Handle destructured imports: { Name1, Name2 }
                  const names = importName
                    .replace(/[{}]/g, '')
                    .split(',')
                    .map((n) => n.trim())
                  names.forEach((name) => {
                    const cleanName = name.replace(/\s+as\s+\w+/, '').trim() // Remove 'as' aliases
                    if (cleanName && /^\w+$/.test(cleanName)) {
                      const nameStart = startCol + fullMatch.indexOf(cleanName)
                      if (nameStart >= startCol) {
                        // Make sure we found it
                        references.push({
                          text: cleanName,
                          startLine: lineIndex,
                          startCol: nameStart,
                          endLine: lineIndex,
                          endCol: nameStart + cleanName.length,
                          type: 'name',
                          associatedPath: importPath
                        })
                      }
                    }
                  })
                } else {
                  // Handle single import name
                  const nameStart = startCol + fullMatch.indexOf(importName)
                  if (nameStart >= startCol) {
                    references.push({
                      text: importName,
                      startLine: lineIndex,
                      startCol: nameStart,
                      endLine: lineIndex,
                      endCol: nameStart + importName.length,
                      type: 'name',
                      associatedPath: importPath
                    })
                  }
                }
              }
            }
          }
        }
        // Reset regex state
        pattern.lastIndex = 0
      })
    })

    return references
  }

  // Setup Monaco editor click handler for references
  const setupReferenceNavigation = (
    editor: any,
    content: string,
    currentFile: ProjectFile
  ) => {
    if (!editor) return

    const references = extractReferences(content, currentFile)

    // Add click handler
    editor.onMouseDown((e: any) => {
      const position = e.target.position
      if (!position) return

      const clickedReference = references.find(
        (ref) =>
          position.lineNumber - 1 === ref.startLine &&
          position.column - 1 >= ref.startCol &&
          position.column - 1 <= ref.endCol
      )

      if (clickedReference) {
        // For name references, use the associated path
        const pathToNavigate =
          clickedReference.type === 'name'
            ? clickedReference.associatedPath
            : clickedReference.text

        if (pathToNavigate) {
          handleReferenceClick(pathToNavigate, currentFile)
        }
      }
    })

    // Add hover decoration for references
    const decorations = references.map((ref) => ({
      range: {
        startLineNumber: ref.startLine + 1,
        startColumn: ref.startCol + 1,
        endLineNumber: ref.endLine + 1,
        endColumn: ref.endCol + 1
      },
      options: {
        inlineClassName:
          ref.type === 'name' ? 'reference-name-link' : 'reference-path-link',
        hoverMessage: {
          value:
            ref.type === 'name'
              ? `Click to navigate to ${ref.associatedPath || 'file'}`
              : 'Click to navigate to file'
        }
      }
    }))

    editor.deltaDecorations([], decorations)

    // Add CSS for reference styling
    const style = document.createElement('style')
    style.textContent = `
      .reference-path-link {
        color: #569cd6 !important;
        text-decoration: underline;
        cursor: pointer;
      }
      .reference-path-link:hover {
        color: #4fc3f7 !important;
      }
      .reference-name-link {
        color: #9cdcfe !important;
        text-decoration: underline;
        cursor: pointer;
        font-weight: 500;
      }
      .reference-name-link:hover {
        color: #87ceeb !important;
        background-color: rgba(156, 220, 254, 0.1);
      }
    `
    document.head.appendChild(style)
  }

  const handleReferenceClick = async (
    referencePath: string,
    currentFile: ProjectFile
  ) => {
    if (!currentFile || hasUnsavedChanges) {
      if (hasUnsavedChanges) {
        const confirmSwitch = window.confirm(
          'You have unsaved changes. Are you sure you want to navigate to the reference?'
        )
        if (!confirmSwitch) return
      }
    }

    let targetFile: ProjectFile | null = null

    // Try different strategies to find the file
    const possibleExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']

    // First, try the exact path
    targetFile = findFileByPath(referencePath, currentFile.path)

    // If not found, try with extensions
    if (!targetFile) {
      for (const ext of possibleExtensions) {
        targetFile = findFileByPath(referencePath + ext, currentFile.path)
        if (targetFile) break
      }
    }

    // If still not found, try just by filename
    if (!targetFile) {
      const fileName = referencePath.split('/').pop()
      if (fileName) {
        targetFile = findFileByName(fileName)
        if (!targetFile) {
          // Try with extensions
          for (const ext of possibleExtensions) {
            targetFile = findFileByName(fileName + ext)
            if (targetFile) break
          }
        }
      }
    }

    if (targetFile) {
      await loadFileContent(targetFile, true, currentFile)
    } else {
      alert(`Could not find reference file: ${referencePath}`)
    }
  }

  const loadFileContent = async (
    file: ProjectFile,
    isReference = false,
    originalFile?: ProjectFile
  ) => {
    setCurrentFileRef({ file, isReference, originalFile })
    setLoadingContent(true)
    setFileContent('')
    setEditedContent('')
    setIsEditing(false)
    setHasUnsavedChanges(false)

    try {
      const content = await window.electronAPI.readFileContent(file.path)
      setFileContent(content)
      setEditedContent(content)
      onFileSelect?.(file.path, file.name)
    } catch (err) {
      console.error('Error reading file content:', err)
      const errorMsg = `Error loading file: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`
      setFileContent(errorMsg)
      setEditedContent(errorMsg)
    } finally {
      setLoadingContent(false)
    }
  }

  const handleFileClick = async (file: ProjectFile) => {
    if (file.type !== 'file') return

    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Are you sure you want to switch files?'
      )
      if (!confirmSwitch) return
    }

    await loadFileContent(file)
  }

  const handleBackToOriginal = () => {
    if (currentFileRef?.originalFile) {
      loadFileContent(currentFileRef.originalFile)
    }
  }

  const handleFolderToggle = (folderPath: string) => {
    const updateTree = (items: ProjectFile[]): ProjectFile[] => {
      return items.map((item) => {
        if (item.path === folderPath && item.type === 'folder') {
          return { ...item, isExpanded: !item.isExpanded }
        }
        if (item.children) {
          return { ...item, children: updateTree(item.children) }
        }
        return item
      })
    }

    setFileTree(updateTree(fileTree))
  }

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || ''
    setEditedContent(newContent)
    setHasUnsavedChanges(newContent !== fileContent)
  }

  const handleSaveFile = async () => {
    if (!currentFileRef?.file || !hasUnsavedChanges) return

    setSavingFile(true)
    try {
      await window.electronAPI.writeFile(
        currentFileRef.file.path,
        editedContent
      )
      setFileContent(editedContent)
      setHasUnsavedChanges(false)
      console.log('File saved successfully:', currentFileRef.file.name)
    } catch (err) {
      console.error('Error saving file:', err)
      alert(
        `Failed to save file: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      )
    } finally {
      setSavingFile(false)
    }
  }

  const handleToggleEdit = () => {
    if (isEditing && hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Discard changes and exit edit mode?'
      )
      if (!confirmDiscard) return

      setEditedContent(fileContent)
      setHasUnsavedChanges(false)
    }

    setIsEditing(!isEditing)
  }

  const closeFileViewer = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmClose) return
    }

    setCurrentFileRef(null)
    setFileContent('')
    setEditedContent('')
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const getMonacoLanguage = (extension: string): string => {
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      h: 'c',
      css: 'css',
      scss: 'scss',
      html: 'html',
      vue: 'html',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      dart: 'dart',
      json: 'json',
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml',
      sql: 'sql',
      md: 'markdown',
      txt: 'plaintext'
    }

    return languageMap[extension] || 'plaintext'
  }

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 32))
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 10))
  }

  const resetFontSize = () => {
    setFontSize(16)
  }

  const handleRefresh = () => {
    if (selectedFolder) {
      loadProjectFiles(selectedFolder)
    }
  }

  const handleSelectNewFolder = async () => {
    try {
      const result = await window.electronAPI.selectFolder()
      if (result) {
        loadProjectFiles(result)
      }
    } catch (err) {
      console.error('Error selecting folder:', err)
      setError('Failed to select folder')
    }
  }

  const getFileIcon = (
    extension: string,
    type: 'file' | 'folder' = 'file',
    isExpanded?: boolean
  ) => {
    const iconClass = 'w-4 h-4'

    if (type === 'folder') {
      return isExpanded ? (
        <FolderOpen className={`${iconClass} text-warning`} />
      ) : (
        <FolderOpen className={`${iconClass} text-warning opacity-70`} />
      )
    }

    if (
      [
        'js',
        'ts',
        'jsx',
        'tsx',
        'py',
        'java',
        'cpp',
        'c',
        'h',
        'php',
        'rb',
        'go',
        'rs',
        'swift',
        'kt',
        'dart'
      ].includes(extension)
    ) {
      return <Code className={`${iconClass} text-primary`} />
    } else if (
      ['json', 'yml', 'yaml', 'xml', 'txt', 'md'].includes(extension)
    ) {
      return <FileText className={`${iconClass} text-info`} />
    } else if (
      ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)
    ) {
      return <Image className={`${iconClass} text-success`} />
    } else if (['zip', 'tar', 'gz', 'rar'].includes(extension)) {
      return <Archive className={`${iconClass} text-warning`} />
    } else {
      return <File className={`${iconClass} text-base-content/60`} />
    }
  }

  const renderTreeNode = (
    item: ProjectFile,
    depth: number = 0
  ): React.ReactNode => {
    const paddingLeft = depth * 20

    if (item.type === 'folder') {
      return (
        <div key={item.path}>
          <div
            className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors"
            style={{ paddingLeft: `${paddingLeft + 12}px` }}
            onClick={() => handleFolderToggle(item.path)}
          >
            <div className="mr-2">
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-base-content/60" />
              ) : (
                <ChevronRight className="w-4 h-4 text-base-content/60" />
              )}
            </div>
            {getFileIcon('', 'folder', item.isExpanded)}
            <span className="ml-2 text-sm font-medium text-base-content select-none">
              {item.name}
            </span>
            {item.children && (
              <span className="ml-2 text-xs text-base-content/50">
                ({item.children.filter((child) => child.type === 'file').length}{' '}
                files)
              </span>
            )}
          </div>

          {item.isExpanded && item.children && (
            <div>
              {item.children.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      )
    } else {
      const isSelected = currentFileRef?.file.path === item.path
      return (
        <div
          key={item.path}
          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? 'bg-primary/10 border border-primary/30'
              : 'hover:bg-base-200'
          }`}
          style={{ paddingLeft: `${paddingLeft + 32}px` }}
          onClick={() => handleFileClick(item)}
        >
          <div className="flex items-center flex-1 min-w-0">
            {getFileIcon(item.extension)}
            <span className="ml-2 text-sm text-base-content truncate">
              {item.name}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              handleFileClick(item)
            }}
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      )
    }
  }

  const searchInTree = (items: ProjectFile[], query: string): ProjectFile[] => {
    const results: ProjectFile[] = []

    items.forEach((item) => {
      if (item.type === 'file') {
        if (
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.path.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push(item)
        }
      } else if (item.children) {
        const childResults = searchInTree(item.children, query)
        if (childResults.length > 0) {
          results.push({
            ...item,
            children: childResults,
            isExpanded: true
          })
        }
      }
    })

    return results
  }

  const getTotalFileCount = (items: ProjectFile[]): number => {
    let count = 0
    items.forEach((item) => {
      if (item.type === 'file') {
        count++
      } else if (item.children) {
        count += getTotalFileCount(item.children)
      }
    })
    return count
  }

  const displayTree = searchQuery
    ? searchInTree(fileTree, searchQuery)
    : fileTree
  const totalFiles = getTotalFileCount(fileTree)

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              className="btn btn-ghost btn-sm p-1 mr-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center mr-3">
              <FolderOpen className="w-5 h-5 text-info" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Project Files
              </h3>
              <p className="text-sm text-base-content/60">
                {selectedFolder
                  ? `${totalFiles} files found`
                  : 'No folder selected'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="btn btn-outline btn-info btn-sm"
              onClick={handleRefresh}
              disabled={loading || !selectedFolder}
              title="Refresh files"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              className="btn btn-outline btn-primary btn-sm"
              onClick={handleSelectNewFolder}
              disabled={loading}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Browse
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            {selectedFolder && (
              <div className="mb-4 p-3 bg-base-200 rounded-lg">
                <p className="text-sm text-base-content/70 font-mono break-all">
                  {selectedFolder}
                </p>
              </div>
            )}

            {totalFiles > 0 && (
              <div className="form-control mb-4">
                <div className="input-group">
                  <span className="bg-base-200">
                    <Search className="w-4 h-4 text-base-content/60" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="input input-bordered w-full focus:input-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-square btn-outline"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-md mr-3"></span>
                <span className="text-base-content/60">
                  Loading project files...
                </span>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setError(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!selectedFolder && !loading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-base-content/40" />
                </div>
                <p className="text-base-content/60 mb-4">
                  No project folder selected
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSelectNewFolder}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Select Project Folder
                </button>
              </div>
            )}

            {!loading && !error && selectedFolder && displayTree.length > 0 && (
              <div className="space-y-1 max-h-80 overflow-y-auto group">
                {displayTree.map((item) => renderTreeNode(item))}
              </div>
            )}

            {!loading &&
              !error &&
              selectedFolder &&
              displayTree.length === 0 &&
              totalFiles > 0 && (
                <div className="text-center py-6">
                  <Search className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/60">
                    No files match your search
                  </p>
                </div>
              )}

            {!loading && !error && selectedFolder && totalFiles === 0 && (
              <div className="text-center py-6">
                <File className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                <p className="text-base-content/60">
                  No supported files found in this folder
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* File Content Modal */}
      {currentFileRef && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-7xl max-h-[95vh] p-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-base-300">
              <div className="flex items-center">
                {currentFileRef.isReference && currentFileRef.originalFile && (
                  <button
                    className="btn btn-ghost btn-sm mr-2"
                    onClick={handleBackToOriginal}
                    title="Back to original file"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                {getFileIcon(currentFileRef.file.extension)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    {currentFileRef.file.name}
                    {currentFileRef.isReference && (
                      <span className="ml-2 px-2 py-1 text-xs bg-info/20 text-info rounded">
                        Reference
                      </span>
                    )}
                    {hasUnsavedChanges && (
                      <span
                        className="ml-2 w-2 h-2 bg-warning rounded-full"
                        title="Unsaved changes"
                      ></span>
                    )}
                  </h3>
                  <p className="text-sm text-base-content/60 font-mono">
                    {currentFileRef.file.path}
                  </p>
                  {currentFileRef.isReference &&
                    currentFileRef.originalFile && (
                      <p className="text-xs text-info">
                        Referenced from: {currentFileRef.originalFile.name}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Font Size Controls */}
                <div className="flex items-center gap-1 border border-base-300 rounded-lg p-1">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={decreaseFontSize}
                    disabled={fontSize <= 10}
                    title="Decrease font size"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs px-2 py-1 bg-base-100 rounded min-w-[3rem] text-center">
                    {fontSize}px
                  </span>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={increaseFontSize}
                    disabled={fontSize >= 32}
                    title="Increase font size"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={resetFontSize}
                    title="Reset font size to default"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* Edit Toggle Button - Only show for non-reference files or allow editing */}
                <button
                  className={`btn btn-sm ${
                    isEditing ? 'btn-warning' : 'btn-outline btn-primary'
                  }`}
                  onClick={handleToggleEdit}
                  disabled={loadingContent}
                  title={isEditing ? 'Exit edit mode' : 'Enable editing'}
                >
                  {isEditing ? (
                    <>
                      <Lock className="w-4 h-4 mr-1" />
                      Read Only
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </>
                  )}
                </button>

                {/* Save Button */}
                {isEditing && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleSaveFile}
                    disabled={
                      !hasUnsavedChanges || savingFile || loadingContent
                    }
                    title="Save changes"
                  >
                    {savingFile ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-1"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </>
                    )}
                  </button>
                )}

                {/* Close Button */}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={closeFileViewer}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1" style={{ height: 'calc(95vh - 120px)' }}>
              {loadingContent ? (
                <div className="flex items-center justify-center h-full">
                  <span className="loading loading-spinner loading-lg mr-3"></span>
                  <span className="text-base-content/60">
                    Loading file content...
                  </span>
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={getMonacoLanguage(currentFileRef.file.extension)}
                  value={editedContent}
                  onChange={handleEditorChange}
                  onMount={(editor) => {
                    editorRef.current = editor
                    setupReferenceNavigation(
                      editor,
                      editedContent,
                      currentFileRef.file
                    )
                  }}
                  options={{
                    readOnly: !isEditing,
                    minimap: { enabled: true },
                    fontSize: fontSize,
                    lineNumbers: 'on',
                    rulers: [80, 120],
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    renderWhitespace: 'selection',
                    bracketPairColorization: { enabled: true },
                    guides: {
                      indentation: true,
                      highlightActiveIndentation: true
                    },
                    suggest: {
                      enabled: isEditing
                    },
                    quickSuggestions: isEditing,
                    parameterHints: {
                      enabled: isEditing
                    }
                  }}
                  theme="vs-dark"
                  loading={
                    <div className="flex items-center justify-center h-full">
                      <span className="loading loading-spinner loading-lg mr-3"></span>
                      <span className="text-base-content/60">
                        Loading editor...
                      </span>
                    </div>
                  }
                />
              )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between p-3 border-t border-base-300 bg-base-200">
              <div className="flex items-center gap-4 text-sm text-base-content/70">
                <span>
                  Language: {getMonacoLanguage(currentFileRef.file.extension)}
                </span>
                <span>Lines: {editedContent.split('\n').length}</span>
                <span>Characters: {editedContent.length}</span>
                <span>Font: {fontSize}px</span>
                {currentFileRef.isReference && (
                  <span className="text-info">
                    • Reference Navigation Active - Click import names or paths
                    to navigate
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                {isEditing && (
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges ? (
                      <span className="text-warning flex items-center">
                        <span className="w-2 h-2 bg-warning rounded-full mr-1"></span>
                        Unsaved changes
                      </span>
                    ) : (
                      <span className="text-success flex items-center">
                        <span className="w-2 h-2 bg-success rounded-full mr-1"></span>
                        All changes saved
                      </span>
                    )}
                  </div>
                )}

                <span className="text-base-content/50">
                  {isEditing ? 'Edit Mode' : 'Read Only'}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Backdrop */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeFileViewer}>close</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProjectFileViewer
