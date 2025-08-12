import React, { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import * as path from 'path'

interface MonacoCodeViewerProps {
  filePath?: string
  fileName?: string
  onClose?: () => void
}

const MonacoCodeViewer: React.FC<MonacoCodeViewerProps> = ({
  filePath,
  fileName,
  onClose
}) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (filePath) {
      loadFileContent()
    }
  }, [filePath])

  const loadFileContent = async () => {
    if (!filePath) return

    setLoading(true)
    setError('')

    try {
      const fileContent = await window.electronAPI.readFileContent(filePath)
      setContent(fileContent)
    } catch (err) {
      console.error('Error loading file content:', err)
      setError(err instanceof Error ? err.message : 'Failed to load file')
      setContent('')
    } finally {
      setLoading(false)
    }
  }

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = path.extname(fileName).toLowerCase()

    const languageMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.h': 'c',
      '.css': 'css',
      '.scss': 'scss',
      '.sass': 'scss',
      '.html': 'html',
      '.htm': 'html',
      '.vue': 'html',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.dart': 'dart',
      '.json': 'json',
      '.xml': 'xml',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.sql': 'sql',
      '.sh': 'shell',
      '.bash': 'shell',
      '.md': 'markdown',
      '.dockerfile': 'dockerfile'
    }

    return languageMap[ext] || 'plaintext'
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const getFileIcon = (fileName: string) => {
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

  if (!filePath || !fileName) {
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No File Selected
          </h3>
          <p className="text-sm text-base-content/60">
            Select a file from the explorer to view its contents
          </p>
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
              <span className="mr-2 text-lg">{getFileIcon(fileName)}</span>
              <div>
                <h4 className="font-semibold text-base-content">{fileName}</h4>
                <p className="text-xs text-base-content/60 font-mono truncate max-w-xs">
                  {filePath}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={copyToClipboard}
                disabled={loading || !content}
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {onClose && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={onClose}
                  title="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* File stats */}
          {content && (
            <div className="mt-2 flex items-center space-x-4 text-xs text-base-content/60">
              <span>{content.split('\n').length} lines</span>
              <span>{new Blob([content]).size} bytes</span>
              <span>{getLanguageFromFileName(fileName)}</span>
            </div>
          )}
        </div>

        {/* Editor Content */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-base-100 flex items-center justify-center z-10">
              <div className="flex items-center">
                <div className="loading loading-spinner loading-sm mr-2"></div>
                <span className="text-sm">Loading file...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
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

          {!loading && !error && (
            <Editor
              height="500px"
              language={
                fileName ? getLanguageFromFileName(fileName) : 'plaintext'
              }
              value={content}
              theme="vs-dark"
              options={{
                readOnly: true,
                automaticLayout: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 0,
                renderWhitespace: 'selection',
                renderControlCharacters: false,
                wordWrap: 'on',
                contextmenu: true,
                selectOnLineNumbers: true,
                roundedSelection: false,
                cursorStyle: 'line',
                mouseWheelZoom: true
              }}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="loading loading-spinner loading-lg"></div>
                  <span className="ml-3">Loading editor...</span>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MonacoCodeViewer
