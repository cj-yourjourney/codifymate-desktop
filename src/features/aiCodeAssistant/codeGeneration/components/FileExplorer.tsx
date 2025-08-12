import React, { useState, useEffect } from 'react'
import * as path from 'path'

interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
  isExpanded?: boolean
}

interface FileExplorerProps {
  projectPath?: string
  onFileSelect: (filePath: string, fileName: string) => void
  selectedFile?: string
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  projectPath,
  onFileSelect,
  selectedFile
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (projectPath) {
      loadProjectFiles()
    }
  }, [projectPath])

  const loadProjectFiles = async () => {
    if (!projectPath) return

    setLoading(true)
    setError('')

    try {
      const files = await window.electronAPI.getProjectFiles(projectPath)
      const tree = buildFileTree(files, projectPath)
      setFileTree(tree)
    } catch (err) {
      console.error('Error loading project files:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const buildFileTree = (filePaths: string[], rootPath: string): FileNode[] => {
    const tree: FileNode[] = []
    const nodeMap = new Map<string, FileNode>()

    // Create root node
    const rootNode: FileNode = {
      name: path.basename(rootPath),
      path: rootPath,
      isDirectory: true,
      children: [],
      isExpanded: true
    }
    nodeMap.set(rootPath, rootNode)
    tree.push(rootNode)

    // Sort files to ensure directories come first
    const sortedFiles = filePaths.sort((a, b) => {
      const aIsDir =
        a.split(path.sep).length > rootPath.split(path.sep).length + 1
      const bIsDir =
        b.split(path.sep).length > rootPath.split(path.sep).length + 1
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1
      return a.localeCompare(b)
    })

    for (const filePath of sortedFiles) {
      const relativePath = path.relative(rootPath, filePath)
      const parts = relativePath.split(path.sep)

      let currentPath = rootPath
      let currentNode = rootNode

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        currentPath = path.join(currentPath, part)

        if (!nodeMap.has(currentPath)) {
          const isLastPart = i === parts.length - 1
          const newNode: FileNode = {
            name: part,
            path: currentPath,
            isDirectory: !isLastPart,
            children: !isLastPart ? [] : undefined,
            isExpanded: false
          }

          nodeMap.set(currentPath, newNode)
          currentNode.children!.push(newNode)
        }

        currentNode = nodeMap.get(currentPath)!
      }
    }

    return tree
  }

  const toggleDirectory = (node: FileNode) => {
    if (!node.isDirectory) return

    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((n) => {
        if (n.path === node.path) {
          return { ...n, isExpanded: !n.isExpanded }
        }
        if (n.children) {
          return { ...n, children: updateTree(n.children) }
        }
        return n
      })
    }

    setFileTree(updateTree(fileTree))
  }

  const handleFileClick = (node: FileNode) => {
    if (node.isDirectory) {
      toggleDirectory(node)
    } else {
      onFileSelect(node.path, node.name)
    }
  }

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      return '📁'
    }

    const ext = path.extname(fileName).toLowerCase()
    const iconMap: { [key: string]: string } = {
      '.js': '🟨',
      '.ts': '🔷',
      '.jsx': '⚛️',
      '.tsx': '⚛️',
      '.py': '🐍',
      '.java': '☕',
      '.cpp': '⚡',
      '.c': '⚡',
      '.h': '📄',
      '.css': '🎨',
      '.scss': '🎨',
      '.html': '🌐',
      '.vue': '💚',
      '.php': '🐘',
      '.rb': '💎',
      '.go': '🐹',
      '.rs': '🦀',
      '.swift': '🦉',
      '.kt': '🎯',
      '.dart': '🎯',
      '.json': '📋',
      '.yml': '📄',
      '.yaml': '📄',
      '.xml': '📄',
      '.sql': '🗄️'
    }

    return iconMap[ext] || '📄'
  }

  const renderFileNode = (
    node: FileNode,
    depth: number = 0
  ): React.ReactNode => {
    const isSelected = selectedFile === node.path

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-base-200 text-sm ${
            isSelected ? 'bg-primary/10 text-primary' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {node.isDirectory && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-3 h-3 mr-1 transition-transform ${
                node.isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          {!node.isDirectory && <span className="w-3 mr-1"></span>}
          <span className="mr-2 text-xs">
            {getFileIcon(node.name, node.isDirectory)}
          </span>
          <span className="truncate" title={node.name}>
            {node.name}
          </span>
        </div>

        {node.isDirectory && node.isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const selectProjectFolder = async () => {
    try {
      const folder = await window.electronAPI.selectFolder()
      if (folder) {
        // This would typically be handled by parent component
        // For now, just trigger a reload if the path matches
        if (folder === projectPath) {
          loadProjectFiles()
        }
      }
    } catch (err) {
      console.error('Error selecting folder:', err)
      setError('Failed to select folder')
    }
  }

  if (!projectPath) {
    return (
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No Project Selected
          </h3>
          <p className="text-sm text-base-content/60 mb-4">
            Select a project folder to explore files
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={selectProjectFolder}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z"
              />
            </svg>
            Select Project
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-0">
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z"
                />
              </svg>
              <h4 className="font-semibold">File Explorer</h4>
            </div>
            <button
              className="btn btn-ghost btn-xs"
              onClick={loadProjectFiles}
              disabled={loading}
              title="Refresh files"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Project path */}
          <div className="mt-2 text-xs text-base-content/60 font-mono bg-base-200 px-2 py-1 rounded truncate">
            {path.basename(projectPath)}
          </div>
        </div>

        {/* File tree */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="loading loading-spinner loading-sm mr-2"></div>
              <span className="text-sm">Loading files...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-center">
              <div className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && fileTree.length > 0 && (
            <div className="py-2">
              {fileTree.map((node) => renderFileNode(node))}
            </div>
          )}

          {!loading && !error && fileTree.length === 0 && (
            <div className="p-8 text-center text-base-content/60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 mx-auto mb-3 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">No files found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileExplorer
