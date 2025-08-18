import React, { useState, useEffect } from 'react'
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
  AlertCircle
} from 'lucide-react'

interface ProjectFile {
  path: string
  name: string
  size?: number
  extension: string
}

interface ProjectFileViewerProps {
  selectedFolder?: string | null
  onFileSelect?: (filePath: string, fileName: string) => void
}

const ProjectFileViewer: React.FC<ProjectFileViewerProps> = ({
  selectedFolder,
  onFileSelect
}) => {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  // Load files when selectedFolder changes
  useEffect(() => {
    if (selectedFolder) {
      loadProjectFiles(selectedFolder)
    } else {
      setFiles([])
    }
  }, [selectedFolder])

  const loadProjectFiles = async (folderPath: string) => {
    setLoading(true)
    setError(null)
    try {
      const filePaths = await window.electronAPI.getProjectFiles(folderPath)

      const projectFiles: ProjectFile[] = filePaths.map((filePath) => {
        const fileName = filePath.split(/[/\\]/).pop() || 'unknown'
        const extension = fileName.split('.').pop()?.toLowerCase() || ''

        return {
          path: filePath,
          name: fileName,
          extension
        }
      })

      // Sort files by name
      projectFiles.sort((a, b) => a.name.localeCompare(b.name))
      setFiles(projectFiles)
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
    setSelectedFile(file)
    setLoadingContent(true)
    setFileContent('')

    try {
      const content = await window.electronAPI.readFileContent(file.path)
      setFileContent(content)
      onFileSelect?.(file.path, file.name)
    } catch (err) {
      console.error('Error reading file content:', err)
      setFileContent(
        `Error loading file: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      )
    } finally {
      setLoadingContent(false)
    }
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

  const getFileIcon = (extension: string) => {
    const iconClass = 'w-4 h-4'

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

  // Filter files based on search query
  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                  ? `${files.length} files found`
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
            {files.length > 0 && (
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

            {/* Files List */}
            {!loading &&
              !error &&
              selectedFolder &&
              filteredFiles.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:bg-base-200 ${
                        selectedFile?.path === file.path
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-base-50 border-base-300 hover:border-base-400'
                      }`}
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {getFileIcon(file.extension)}
                        <div className="ml-3 min-w-0 flex-1">
                          <p className="text-sm font-medium text-base-content truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-base-content/50 font-mono truncate">
                            {file.path
                              .replace(selectedFolder, '')
                              .replace(/^[/\\]/, '')}
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm opacity-60 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFileClick(file)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            {/* No Files Found */}
            {!loading &&
              !error &&
              selectedFolder &&
              filteredFiles.length === 0 &&
              files.length > 0 && (
                <div className="text-center py-6">
                  <Search className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                  <p className="text-base-content/60">
                    No files match your search
                  </p>
                </div>
              )}

            {/* No Files in Folder */}
            {!loading && !error && selectedFolder && files.length === 0 && (
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
      {selectedFile && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getFileIcon(selectedFile.extension)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                  <p className="text-sm text-base-content/60 font-mono">
                    {selectedFile.path}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSelectedFile(null)
                  setFileContent('')
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divider my-4"></div>

            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg mr-3"></span>
                <span className="text-base-content/60">
                  Loading file content...
                </span>
              </div>
            ) : (
              <div className="bg-base-200 rounded-lg p-4 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-base-content whitespace-pre-wrap break-words">
                  {fileContent || 'No content to display'}
                </pre>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSelectedFile(null)
                  setFileContent('')
                }}
              >
                Close
              </button>
              {fileContent && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(fileContent)
                    // You could add a notification here
                  }}
                >
                  Copy Content
                </button>
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => {
                setSelectedFile(null)
                setFileContent('')
              }}
            >
              close
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProjectFileViewer
