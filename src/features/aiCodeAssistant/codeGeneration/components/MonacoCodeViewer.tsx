import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import * as path from 'path'
import {
  FileText,
  Copy,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

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
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [fontSize, setFontSize] = useState(14)

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    if (filePath) {
      loadFileContent()
    }
  }, [filePath])

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const loadFileContent = async () => {
    if (!filePath) return

    setLoading(true)
    setError('')
    setHasUnsavedChanges(false)

    try {
      const fileContent = await window.electronAPI.readFileContent(filePath)
      setContent(fileContent)
      setOriginalContent(fileContent)
    } catch (err) {
      console.error('Error loading file content:', err)
      setError(err instanceof Error ? err.message : 'Failed to load file')
      setContent('')
      setOriginalContent('')
    } finally {
      setLoading(false)
    }
  }

  const saveFile = async () => {
    if (!filePath || !hasUnsavedChanges) return

    setSaving(true)
    try {
      await window.electronAPI.writeFile(filePath, content)
      setOriginalContent(content)
      setHasUnsavedChanges(false)
      setNotification({
        type: 'success',
        message: 'File saved successfully!'
      })
    } catch (err) {
      console.error('Error saving file:', err)
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save file'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || ''
    setContent(newContent)
    setHasUnsavedChanges(newContent !== originalContent)
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Configure Monaco to show error markers
    monaco.editor.setModelMarkers(editor.getModel(), 'owner', [])

    // Add keyboard shortcut for save (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile()
    })
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

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 32) // Max 32px
    setFontSize(newSize)
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize })
    }
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 8) // Min 8px
    setFontSize(newSize)
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize })
    }
  }

  const resetFontSize = () => {
    const defaultSize = 16
    setFontSize(defaultSize)
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: defaultSize })
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setNotification({
        type: 'success',
        message: 'Content copied to clipboard!'
      })
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      setNotification({
        type: 'error',
        message: 'Failed to copy to clipboard'
      })
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No File Selected
          </h3>
          <p className="text-sm text-base-content/60">
            Select a file from the explorer to view and edit its contents
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card bg-base-100 shadow-lg border border-base-200">
      <div className="card-body p-0">
        {/* Notification Toast */}
        {notification.type && (
          <div
            className={`alert shadow-lg m-4 ${
              notification.type === 'success' ? 'alert-success' : 'alert-error'
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <CheckCircle className="stroke-current flex-shrink-0 h-6 w-6 mr-2" />
                ) : (
                  <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6 mr-2" />
                )}
                <span className="text-sm">{notification.message}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setNotification({ type: null, message: '' })}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2 text-lg">{getFileIcon(fileName)}</span>
              <div>
                <div className="flex items-center">
                  <h4 className="font-semibold text-base-content">
                    {fileName}
                  </h4>
                  {hasUnsavedChanges && (
                    <span
                      className="ml-2 w-2 h-2 bg-warning rounded-full"
                      title="Unsaved changes"
                    />
                  )}
                </div>
                <p className="text-xs text-base-content/60 font-mono truncate max-w-xs">
                  {filePath}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Font Size Controls */}
              <div className="flex items-center space-x-1 border border-base-300 rounded-lg p-1">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 8}
                  title="Decrease font size"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-xs px-2 text-base-content/70 min-w-[2rem] text-center">
                  {fontSize}px
                </span>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 32}
                  title="Increase font size"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={resetFontSize}
                  disabled={fontSize === 14}
                  title="Reset font size"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              <div className="divider divider-horizontal mx-1"></div>

              <button
                className="btn btn-ghost btn-sm"
                onClick={saveFile}
                disabled={loading || saving || !hasUnsavedChanges}
                title="Save file (Ctrl+S)"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={loadFileContent}
                disabled={loading}
                title="Reload file"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={copyToClipboard}
                disabled={loading || !content}
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>

              {onClose && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={onClose}
                  title="Close"
                >
                  <X className="w-4 h-4" />
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
              {hasUnsavedChanges && (
                <span className="text-warning font-medium">● Modified</span>
              )}
            </div>
          )}
        </div>

        {/* Editor Content */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-base-100 flex items-center justify-center z-10">
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading file...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="alert alert-error">
                <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && (
            <Editor
              height="700px" // Increased height significantly
              language={
                fileName ? getLanguageFromFileName(fileName) : 'plaintext'
              }
              value={content}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                readOnly: false, // Made editable
                automaticLayout: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: fontSize, // Use dynamic font size
                lineNumbers: 'on',
                glyphMargin: true, // Enable glyph margin for error indicators
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderWhitespace: 'selection',
                renderControlCharacters: false,
                wordWrap: 'on',
                contextmenu: true,
                selectOnLineNumbers: true,
                roundedSelection: false,
                cursorStyle: 'line',
                mouseWheelZoom: true,
                // Error and validation settings
                showUnused: true,
                showDeprecated: true,
                suggest: {
                  showMethods: true,
                  showFunctions: true,
                  showConstructors: true,
                  showFields: true,
                  showVariables: true,
                  showClasses: true,
                  showStructs: true,
                  showInterfaces: true,
                  showModules: true,
                  showProperties: true,
                  showEvents: true,
                  showOperators: true,
                  showUnits: true,
                  showValues: true,
                  showConstants: true,
                  showEnums: true,
                  showEnumMembers: true,
                  showKeywords: true,
                  showText: true,
                  showColors: true,
                  showFiles: true,
                  showReferences: true,
                  showCustomcolors: true,
                  showFolders: true,
                  showTypeParameters: true,
                  showSnippets: true
                },
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false
                },
                parameterHints: {
                  enabled: true
                },
                hover: {
                  enabled: true
                },
                // Enable problem markers (errors, warnings)
                renderValidationDecorations: 'on'
              }}
              loading={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-3">Loading editor...</span>
                </div>
              }
            />
          )}
        </div>

        {/* Status bar */}
        {!loading && !error && (
          <div className="px-4 py-2 bg-base-200 border-t border-base-300 text-xs text-base-content/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Ln {content.split('\n').length}, Col 1</span>
                <span>{getLanguageFromFileName(fileName).toUpperCase()}</span>
                <span>UTF-8</span>
                <span>Font: {fontSize}px</span>
              </div>
              <div className="flex items-center space-x-4">
                {hasUnsavedChanges && (
                  <span className="text-warning">Unsaved changes</span>
                )}
                <span>Press Ctrl+S to save</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MonacoCodeViewer
