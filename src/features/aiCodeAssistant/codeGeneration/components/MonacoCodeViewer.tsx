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
  RotateCcw,
  Plus
} from 'lucide-react'

interface FileTab {
  id: string
  filePath: string
  fileName: string
  content: string
  originalContent: string
  hasUnsavedChanges: boolean
  isLoading: boolean
  error: string
}

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
  const [tabs, setTabs] = useState<FileTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState(16)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  // Watch for new file selection from parent
  useEffect(() => {
    if (filePath && fileName) {
      openFileInTab(filePath, fileName)
    }
  }, [filePath, fileName])

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Add Command+click detection for file links
  useEffect(() => {
    const handleEditorClick = (event: any) => {
      if (event.metaKey || event.ctrlKey) {
        // Command on Mac, Ctrl on Windows/Linux
        const position = event.target?.getTargetAtClientPoint?.(
          event.browserEvent.clientX,
          event.browserEvent.clientY
        )
        if (position?.element?.type === 'text') {
          const word = editorRef.current
            ?.getModel()
            ?.getWordAtPosition(position.position)
          if (word) {
            // Try to resolve file path for the clicked word
            handleFileNavigation(word.word, position.position)
          }
        }
      }
    }

    if (editorRef.current) {
      editorRef.current.onMouseDown(handleEditorClick)
    }
  }, [activeTabId])

  const generateTabId = (filePath: string): string => {
    return btoa(filePath)
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 16)
  }

  const openFileInTab = async (newFilePath: string, newFileName: string) => {
    const tabId = generateTabId(newFilePath)

    // Check if tab already exists
    const existingTab = tabs.find((tab) => tab.id === tabId)
    if (existingTab) {
      setActiveTabId(tabId)
      return
    }

    // Create new tab with loading state
    const newTab: FileTab = {
      id: tabId,
      filePath: newFilePath,
      fileName: newFileName,
      content: '',
      originalContent: '',
      hasUnsavedChanges: false,
      isLoading: true,
      error: ''
    }

    setTabs((prevTabs) => [...prevTabs, newTab])
    setActiveTabId(tabId)

    // Load file content
    try {
      const fileContent = await window.electronAPI.readFileContent(newFilePath)
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                content: fileContent,
                originalContent: fileContent,
                isLoading: false
              }
            : tab
        )
      )
    } catch (err) {
      console.error('Error loading file content:', err)
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                error:
                  err instanceof Error ? err.message : 'Failed to load file',
                isLoading: false
              }
            : tab
        )
      )
    }
  }

  const handleFileNavigation = async (word: string, position: any) => {
    const currentTab = tabs.find((tab) => tab.id === activeTabId)
    if (!currentTab) return

    // Simple heuristic to detect file imports/requires
    const line = editorRef.current
      ?.getModel()
      ?.getLineContent(position.lineNumber)
    if (!line) return

    // Look for patterns like import ... from './path' or require('./path')
    const importRegex =
      /(?:import.*from\s*['"`]|require\s*\(\s*['"`])([^'"`]+)['"`]/
    const match = line.match(importRegex)

    if (match && match[1]) {
      let importPath = match[1]

      // Resolve relative path
      const currentDir = path.dirname(currentTab.filePath)
      let resolvedPath = path.resolve(currentDir, importPath)

      // Try common extensions if no extension provided
      const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json']
      let finalPath = resolvedPath

      try {
        // First try the path as-is
        await window.electronAPI.readFileContent(resolvedPath)
        finalPath = resolvedPath
      } catch {
        // Try with extensions
        let found = false
        for (const ext of extensions) {
          try {
            const pathWithExt = resolvedPath + ext
            await window.electronAPI.readFileContent(pathWithExt)
            finalPath = pathWithExt
            found = true
            break
          } catch {
            continue
          }
        }

        if (!found) {
          setNotification({
            type: 'error',
            message: `Could not find file: ${importPath}`
          })
          return
        }
      }

      // Open the resolved file
      const newFileName = path.basename(finalPath)
      await openFileInTab(finalPath, newFileName)
    }
  }

  const closeTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    const tabToClose = tabs.find((tab) => tab.id === tabId)
    if (tabToClose?.hasUnsavedChanges) {
      if (
        !confirm(`${tabToClose.fileName} has unsaved changes. Close anyway?`)
      ) {
        return
      }
    }

    const newTabs = tabs.filter((tab) => tab.id !== tabId)
    setTabs(newTabs)

    // Set new active tab if closing current active tab
    if (activeTabId === tabId) {
      const activeIndex = tabs.findIndex((tab) => tab.id === tabId)
      const newActiveTab = newTabs[Math.max(0, activeIndex - 1)] || newTabs[0]
      setActiveTabId(newActiveTab?.id || null)
    }
  }

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId)
  }

  const updateTabContent = (tabId: string, newContent: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              content: newContent,
              hasUnsavedChanges: newContent !== tab.originalContent
            }
          : tab
      )
    )
  }

  const saveFile = async (tabId?: string) => {
    const targetTabId = tabId || activeTabId
    if (!targetTabId) return

    const tab = tabs.find((t) => t.id === targetTabId)
    if (!tab || !tab.hasUnsavedChanges) return

    try {
      await window.electronAPI.writeFile(tab.filePath, tab.content)

      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === targetTabId
            ? { ...t, originalContent: t.content, hasUnsavedChanges: false }
            : t
        )
      )

      setNotification({
        type: 'success',
        message: `${tab.fileName} saved successfully!`
      })
    } catch (err) {
      console.error('Error saving file:', err)
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save file'
      })
    }
  }

  const reloadFile = async (tabId?: string) => {
    const targetTabId = tabId || activeTabId
    if (!targetTabId) return

    const tab = tabs.find((t) => t.id === targetTabId)
    if (!tab) return

    if (tab.hasUnsavedChanges) {
      if (!confirm(`${tab.fileName} has unsaved changes. Reload anyway?`)) {
        return
      }
    }

    setTabs((prevTabs) =>
      prevTabs.map((t) =>
        t.id === targetTabId ? { ...t, isLoading: true, error: '' } : t
      )
    )

    try {
      const fileContent = await window.electronAPI.readFileContent(tab.filePath)
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === targetTabId
            ? {
                ...t,
                content: fileContent,
                originalContent: fileContent,
                hasUnsavedChanges: false,
                isLoading: false
              }
            : t
        )
      )
    } catch (err) {
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === targetTabId
            ? {
                ...t,
                error:
                  err instanceof Error ? err.message : 'Failed to reload file',
                isLoading: false
              }
            : t
        )
      )
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (!activeTabId) return
    const newContent = value || ''
    updateTabContent(activeTabId, newContent)
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Configure Monaco to show error markers
    monaco.editor.setModelMarkers(editor.getModel(), 'owner', [])

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFile()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW, () => {
      if (activeTabId) {
        closeTab(activeTabId, { stopPropagation: () => {} } as any)
      }
    })
  }

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 32)
    setFontSize(newSize)
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize: newSize })
    }
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 8)
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
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    if (!activeTab) return

    try {
      await navigator.clipboard.writeText(activeTab.content)
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

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  if (tabs.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No Files Open
          </h3>
          <p className="text-sm text-base-content/60 mb-4">
            Select files from the explorer to view and edit their contents
          </p>
          <div className="text-xs text-base-content/50 space-y-1">
            <p>
              💡 Tip: Hold Command/Ctrl and click on import statements to open
              files
            </p>
            <p>⌨️ Shortcuts: Cmd+S to save, Cmd+W to close tab</p>
          </div>
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

        {/* File Tabs */}
        <div className="flex items-center bg-base-200 border-b border-base-300 overflow-x-auto">
          <div className="flex items-center min-w-0 flex-1">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center px-3 py-2 cursor-pointer border-r border-base-300 min-w-0 group hover:bg-base-100 ${
                  activeTabId === tab.id
                    ? 'bg-base-100 border-b-2 border-primary'
                    : ''
                }`}
                onClick={() => switchTab(tab.id)}
              >
                <span className="mr-2 text-xs flex-shrink-0">
                  {getFileIcon(tab.fileName)}
                </span>
                <span
                  className="text-sm truncate max-w-32"
                  title={tab.fileName}
                >
                  {tab.fileName}
                </span>
                {tab.hasUnsavedChanges && (
                  <span className="ml-1 w-1.5 h-1.5 bg-warning rounded-full flex-shrink-0" />
                )}
                {tab.isLoading && (
                  <Loader2 className="w-3 h-3 ml-2 animate-spin flex-shrink-0" />
                )}
                <button
                  className="ml-2 p-0.5 rounded hover:bg-base-200 opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={(e) => closeTab(tab.id, e)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Tab Controls */}
          <div className="flex items-center px-2 space-x-1 border-l border-base-300">
            {/* Font Size Controls */}
            <div className="flex items-center space-x-1 border border-base-300 rounded p-1">
              <button
                className="btn btn-ghost btn-xs p-1"
                onClick={decreaseFontSize}
                disabled={fontSize <= 8}
                title="Decrease font size"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-xs px-1 text-base-content/70 min-w-[1.5rem] text-center">
                {fontSize}
              </span>
              <button
                className="btn btn-ghost btn-xs p-1"
                onClick={increaseFontSize}
                disabled={fontSize >= 32}
                title="Increase font size"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                className="btn btn-ghost btn-xs p-1"
                onClick={resetFontSize}
                disabled={fontSize === 16}
                title="Reset font size"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Tab Header */}
        {activeTab && (
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <span className="mr-2 text-lg">
                  {getFileIcon(activeTab.fileName)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-base-content truncate">
                      {activeTab.fileName}
                    </h4>
                    {activeTab.hasUnsavedChanges && (
                      <span className="ml-2 w-2 h-2 bg-warning rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-base-content/60 font-mono truncate">
                    {activeTab.filePath}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => saveFile()}
                  disabled={activeTab.isLoading || !activeTab.hasUnsavedChanges}
                  title="Save file (Ctrl+S)"
                >
                  <Save className="w-4 h-4" />
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => reloadFile()}
                  disabled={activeTab.isLoading}
                  title="Reload file"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={copyToClipboard}
                  disabled={activeTab.isLoading || !activeTab.content}
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {onClose && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={onClose}
                    title="Close viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* File stats */}
            {activeTab.content && !activeTab.isLoading && (
              <div className="mt-2 flex items-center space-x-4 text-xs text-base-content/60">
                <span>{activeTab.content.split('\n').length} lines</span>
                <span>{new Blob([activeTab.content]).size} bytes</span>
                <span>{getLanguageFromFileName(activeTab.fileName)}</span>
                <span>Font: {fontSize}px</span>
                {activeTab.hasUnsavedChanges && (
                  <span className="text-warning font-medium">● Modified</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Editor Content */}
        <div className="relative">
          {activeTab?.isLoading && (
            <div className="absolute inset-0 bg-base-100 flex items-center justify-center z-10">
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading {activeTab.fileName}...</span>
              </div>
            </div>
          )}

          {activeTab?.error && (
            <div className="p-6">
              <div className="alert alert-error">
                <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6" />
                <span className="text-sm">{activeTab.error}</span>
              </div>
            </div>
          )}

          {activeTab && !activeTab.isLoading && !activeTab.error && (
            <Editor
              height="700px"
              language={getLanguageFromFileName(activeTab.fileName)}
              value={activeTab.content}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                readOnly: false,
                automaticLayout: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: fontSize,
                lineNumbers: 'on',
                glyphMargin: true,
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
                // Enhanced settings for better development experience
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
                parameterHints: { enabled: true },
                hover: { enabled: true },
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
        {activeTab && !activeTab.isLoading && !activeTab.error && (
          <div className="px-4 py-2 bg-base-200 border-t border-base-300 text-xs text-base-content/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Ln {activeTab.content.split('\n').length}, Col 1</span>
                <span>
                  {getLanguageFromFileName(activeTab.fileName).toUpperCase()}
                </span>
                <span>UTF-8</span>
                <span>
                  {tabs.length} tab{tabs.length !== 1 ? 's' : ''} open
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {activeTab.hasUnsavedChanges && (
                  <span className="text-warning">Unsaved changes</span>
                )}
                <span>
                  Cmd+Click imports to navigate • Cmd+S to save • Cmd+W to close
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MonacoCodeViewer
