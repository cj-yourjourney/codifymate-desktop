import React, { useState, useEffect, useMemo } from 'react'
import { parseDiff, Diff, Hunk } from 'react-diff-view'
import 'react-diff-view/style/index.css'

interface DiffModalProps {
  isOpen: boolean
  onClose: () => void
  file: {
    file_path: string
    change_type: string
    description: string
    code: string
  }
  onConfirm: () => void
}

const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  onClose,
  file,
  onConfirm
}) => {
  const [originalContent, setOriginalContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Load original file content when modal opens
  useEffect(() => {
    if (isOpen && file) {
      loadOriginalContent()
    }
  }, [isOpen, file])

  const loadOriginalContent = async () => {
    if (file.change_type === 'create') {
      setOriginalContent('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const content = await window.electronAPI.readFileContent(file.file_path)
      setOriginalContent(content || '')
    } catch (err) {
      console.warn('Could not read original file:', err)
      setOriginalContent('')
      setError('Original file not found - will be created as new file')
    } finally {
      setLoading(false)
    }
  }

  // Generate unified diff format - Always call this hook
  const diffText = useMemo(() => {
    if (!file) return ''

    if (file.change_type === 'create') {
      // For new files, show all content as added
      const lines = file.code.split('\n')
      const header = `--- /dev/null\n+++ ${file.file_path}\n@@ -0,0 +1,${lines.length} @@`
      const content = lines.map((line) => `+${line}`).join('\n')
      return `${header}\n${content}`
    } else {
      // For modifications, create a proper unified diff
      const originalLines = originalContent.split('\n')
      const newLines = file.code.split('\n')

      const header = `--- ${file.file_path}\n+++ ${file.file_path}\n@@ -1,${originalLines.length} +1,${newLines.length} @@`

      let diffContent = ''
      const maxLines = Math.max(originalLines.length, newLines.length)

      for (let i = 0; i < maxLines; i++) {
        const originalLine = originalLines[i]
        const newLine = newLines[i]

        if (originalLine === newLine) {
          diffContent += ` ${originalLine || ''}\n`
        } else {
          if (originalLine !== undefined) {
            diffContent += `-${originalLine}\n`
          }
          if (newLine !== undefined) {
            diffContent += `+${newLine}\n`
          }
        }
      }

      return `${header}\n${diffContent}`
    }
  }, [originalContent, file])

  // Parse the diff - Always call this hook
  const files = useMemo(() => {
    if (!diffText) return []

    try {
      return parseDiff(diffText)
    } catch (error) {
      console.error('Error parsing diff:', error)
      return []
    }
  }, [diffText])

  // Calculate stats - Always call this hook
  const stats = useMemo(() => {
    if (files.length === 0) return { added: 0, removed: 0, modified: 0 }

    const file = files[0]
    let added = 0,
      removed = 0

    file.hunks.forEach((hunk) => {
      hunk.changes.forEach((change) => {
        if (change.type === 'insert') added++
        if (change.type === 'delete') removed++
      })
    })

    return { added, removed, modified: Math.min(added, removed) }
  }, [files])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  // Early return after all hooks
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-base-content">
                File Changes Preview
              </h2>
              <p className="text-sm text-base-content/60 mt-1 font-mono">
                {file.file_path}
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
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
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 mt-4">
            <span
              className={`badge badge-sm ${
                file.change_type === 'create'
                  ? 'badge-success'
                  : 'badge-warning'
              }`}
            >
              {file.change_type}
            </span>
            {stats.added > 0 && (
              <div className="text-sm text-success font-medium">
                +{stats.added} additions
              </div>
            )}
            {stats.removed > 0 && (
              <div className="text-sm text-error font-medium">
                -{stats.removed} deletions
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-3 p-3 bg-base-200 rounded-lg">
            <p className="text-sm text-base-content/80">{file.description}</p>
          </div>

          {error && (
            <div className="alert alert-warning mt-3">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="loading loading-spinner loading-lg"></div>
              <span className="ml-3">Loading original file...</span>
            </div>
          ) : (
            <div className="h-full bg-white">
              {file.change_type === 'create' && originalContent === '' ? (
                /* New file view */
                <div className="h-full overflow-auto p-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✅ New File Creation
                    </h3>
                    <p className="text-sm text-green-700">
                      This file will be created with{' '}
                      {file.code.split('\n').length} lines
                    </p>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 text-sm font-medium border-b">
                      📄 {file.file_path.split('/').pop()}
                    </div>
                    <div className="bg-gray-50 max-h-96 overflow-auto">
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap text-gray-800">
                        {file.code}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : files.length > 0 ? (
                /* React Diff View */
                <div className="h-full overflow-auto">
                  <style jsx>{`
                    .diff-view {
                      font-size: 14px;
                      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    }
                    .diff-view .diff-gutter-col {
                      width: 50px;
                      background-color: #f8f9fa;
                      border-right: 1px solid #e1e4e8;
                    }
                    .diff-view .diff-code-insert {
                      background-color: #e6ffed;
                    }
                    .diff-view .diff-code-delete {
                      background-color: #ffeef0;
                    }
                    .diff-view .diff-code-insert .diff-code-text {
                      background-color: #acf2bd;
                    }
                    .diff-view .diff-code-delete .diff-code-text {
                      background-color: #fdb8c0;
                    }
                  `}</style>

                  {files.map((file, index) => (
                    <Diff
                      key={`${file.oldRevision}-${file.newRevision}-${index}`}
                      viewType="split"
                      diffType={file.type}
                      hunks={file.hunks}
                      className="diff-view"
                    >
                      {(hunks) =>
                        hunks.map((hunk, hunkIndex) => (
                          <Hunk
                            key={`${hunk.content}-${hunkIndex}`}
                            hunk={hunk}
                          />
                        ))
                      }
                    </Diff>
                  ))}
                </div>
              ) : (
                /* Fallback simple view */
                <div className="h-full overflow-auto p-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      ⚠️ Unable to generate diff
                    </h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      Showing raw content instead:
                    </p>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 text-sm font-medium border-b">
                        Updated Content
                      </div>
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                        {file.code}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-base-300">
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-content/60">
              {file.change_type === 'create' ? (
                <>Create new file with {file.code.split('\n').length} lines</>
              ) : (
                <>
                  Apply changes • {stats.added} additions • {stats.removed}{' '}
                  deletions
                </>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={`btn ${
                  file.change_type === 'create' ? 'btn-success' : 'btn-warning'
                }`}
                onClick={handleConfirm}
                disabled={loading}
              >
                {file.change_type === 'create' ? (
                  <>
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create File
                  </>
                ) : (
                  <>
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Update File
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiffModal
