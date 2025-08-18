import React, { useState, useEffect } from 'react'
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
  RotateCcw
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

interface ProjectFileViewerProps {
  selectedFolder?: string | null
  onFileSelect?: (filePath: string, fileName: string) => void
}

const ProjectFileViewer: React.FC<ProjectFileViewerProps> = ({
  selectedFolder,
  onFileSelect
}) => {
  const [fileTree, setFileTree] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [editedContent, setEditedContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savingFile, setSavingFile] = useState(false)
  const [fontSize, setFontSize] = useState(16) // Default font size

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
        // File is in root
        tree.push(file)
      } else {
        // File is in a subfolder
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
        // Folder is in root
        tree.push(folder)
      } else {
        // Folder is in a parent folder
        const parentFolderPath = rootPath + '/' + parts.slice(0, -1).join('/')
        const parentFolder = pathMap.get(parentFolderPath)
        if (parentFolder && parentFolder.children) {
          parentFolder.children.push(folder)
        }
      }
    })

    // Sort: folders first, then files, both alphabetically
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

  const handleFileClick = async (file: ProjectFile) => {
    // Only handle file clicks, not folder clicks
    if (file.type !== 'file') return

    // Check for unsaved changes before switching files
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Are you sure you want to switch files?'
      )
      if (!confirmSwitch) return
    }

    setSelectedFile(file)
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
    if (!selectedFile || !hasUnsavedChanges) return

    setSavingFile(true)
    try {
      await window.electronAPI.writeFile(selectedFile.path, editedContent)
      setFileContent(editedContent)
      setHasUnsavedChanges(false)

      // You could add a success notification here if you have a notification system
      console.log('File saved successfully:', selectedFile.name)
    } catch (err) {
      console.error('Error saving file:', err)
      // You could add an error notification here
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

      // Reset to original content
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

    setSelectedFile(null)
    setFileContent('')
    setEditedContent('')
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  // Get Monaco language based on file extension
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

  // Font size controls
  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 32)) // Max 32px
  }

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 10)) // Min 10px
  }

  const resetFontSize = () => {
    setFontSize(16) // Reset to default
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

  // Render tree node recursively
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
      // File node
      const isSelected = selectedFile?.path === item.path
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

  // Search functionality for tree structure
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
            isExpanded: true // Auto-expand folders with matching files
          })
        }
      }
    })

    return results
  }

  // Get total file count from tree
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

  // Get filtered tree for search
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
            {/* Selected Folder Path */}
            {selectedFolder && (
              <div className="mb-4 p-3 bg-base-200 rounded-lg">
                <p className="text-sm text-base-content/70 font-mono break-all">
                  {selectedFolder}
                </p>
              </div>
            )}

            {/* Search */}
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

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-md mr-3"></span>
                <span className="text-base-content/60">
                  Loading project files...
                </span>
              </div>
            )}

            {/* Error State */}
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

            {/* No Folder Selected */}
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

            {/* File Tree */}
            {!loading && !error && selectedFolder && displayTree.length > 0 && (
              <div className="space-y-1 max-h-80 overflow-y-auto group">
                {displayTree.map((item) => renderTreeNode(item))}
              </div>
            )}

            {/* No Files Found */}
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

            {/* No Files in Folder */}
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

      {/* File Content Modal with Monaco Editor */}
      {selectedFile && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-7xl max-h-[95vh] p-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-base-300">
              <div className="flex items-center">
                {getFileIcon(selectedFile.extension)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    {selectedFile.name}
                    {hasUnsavedChanges && (
                      <span
                        className="ml-2 w-2 h-2 bg-warning rounded-full"
                        title="Unsaved changes"
                      ></span>
                    )}
                  </h3>
                  <p className="text-sm text-base-content/60 font-mono">
                    {selectedFile.path}
                  </p>
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

                {/* Edit Toggle Button */}
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
                  language={getMonacoLanguage(selectedFile.extension)}
                  value={editedContent}
                  onChange={handleEditorChange}
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
                  Language: {getMonacoLanguage(selectedFile.extension)}
                </span>
                <span>Lines: {editedContent.split('\n').length}</span>
                <span>Characters: {editedContent.length}</span>
                <span>Font: {fontSize}px</span>
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
