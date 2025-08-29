import React, { useState } from 'react'
import {
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  setCurrentVersion,
  clearError,
  refineCode
} from './state/codeGenerationSlice'

const Step3CodeGeneration = () => {
  const dispatch = useAppDispatch()
  const { versions, currentVersionId, isRefining, error } = useAppSelector(
    (state) => state.codeGeneration
  )
  const { projectStructure } = useAppSelector((state) => state.relevantFiles)

  const [refinePrompt, setRefinePrompt] = useState('')
  const [expandedFiles, setExpandedFiles] = useState(new Set(['0']))
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const currentVersion =
    versions.find((v) => v.id === currentVersionId) ||
    versions[versions.length - 1]

  const handleRefine = async () => {
    if (!refinePrompt.trim()) {
      showNotification('Please enter refinement instructions', 'error')
      return
    }

    if (!currentVersion || !projectStructure) {
      showNotification('Missing required data for refinement', 'error')
      return
    }

    const refinementRequest = {
      current_version: {
        id: currentVersion.id,
        version: currentVersion.version,
        explanation: currentVersion.generated_code.explanation,
        files_to_modify: currentVersion.generated_code.files_to_modify,
        additional_notes: currentVersion.generated_code.additional_notes
      },
      refinement_feedback: refinePrompt.trim(),
      project_structure: projectStructure
    }

    dispatch(refineCode(refinementRequest))
    setRefinePrompt('')
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const toggleFileExpanded = (index: number) => {
    const newExpanded = new Set(expandedFiles)
    const key = index.toString()
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedFiles(newExpanded)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('Copied to clipboard', 'success')
    } catch (err) {
      showNotification('Failed to copy', 'error')
    }
  }

  const downloadFile = (file: any) => {
    const blob = new Blob([file.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.file_path.split('/').pop() || 'file'
    a.click()
    URL.revokeObjectURL(url)
    showNotification('File downloaded', 'success')
  }

  const fileName = (path: string) => path.split('/').pop() || path

  // Loading state
  if (versions.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <h3 className="font-medium text-gray-900 mb-2">Generating Code</h3>
          <p className="text-sm text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  if (!currentVersion) {
    return (
      <div className="max-w-xl mx-auto mt-16">
        <div className="bg-white rounded-lg border p-8 text-center">
          <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">No Code Generated</h3>
          <p className="text-sm text-gray-600">Please go back and try again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-3 rounded flex items-center space-x-2 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex justify-between items-center">
          <span className="text-red-700 text-sm">{error}</span>
          <X
            className="w-4 h-4 text-red-500 cursor-pointer"
            onClick={() => dispatch(clearError())}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Generated Code</h3>
                <p className="text-sm text-gray-500">
                  {currentVersion.generated_code.files_to_modify.length} files •{' '}
                  {currentVersion.credits_used} credits used
                </p>
              </div>
              {versions.length > 1 && (
                <select
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  value={currentVersionId || ''}
                  onChange={(e) => dispatch(setCurrentVersion(e.target.value))}
                >
                  {versions.map((version, index) => (
                    <option key={version.id} value={version.id}>
                      v{versions.length - index}
                      {version.refinement_prompt ? ' (refined)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-gray-700">
                {currentVersion.generated_code.explanation}
              </p>
              {currentVersion.refinement_prompt && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Last refinement:</span>{' '}
                    {currentVersion.refinement_prompt}
                  </p>
                </div>
              )}
            </div>

            {/* Files */}
            <div className="space-y-2">
              {currentVersion.generated_code.files_to_modify.map(
                (file, index) => (
                  <div key={index} className="border border-gray-200 rounded">
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleFileExpanded(index)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {expandedFiles.has(index.toString()) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="text-sm truncate">
                          {fileName(file.file_path)}
                        </span>
                        <span
                          className={`px-1 py-0.5 text-xs rounded ${
                            file.change_type === 'create'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {file.change_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(file.code)
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadFile(file)
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {expandedFiles.has(index.toString()) && (
                      <div className="border-t border-gray-200 p-3">
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto">
                          <code>{file.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Sticky Refinement Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-4 sticky top-6">
            <h3 className="font-medium text-gray-900 mb-3">Refine Code</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refinement Instructions
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Describe improvements you'd like..."
                  value={refinePrompt}
                  onChange={(e) =>
                    setRefinePrompt(e.target.value.slice(0, 500))
                  }
                  disabled={isRefining}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {refinePrompt.length}/500 characters
                </div>
              </div>

              <button
                onClick={handleRefine}
                disabled={isRefining || !refinePrompt.trim()}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm"
              >
                {isRefining ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                    Refining...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Refine Code
                  </>
                )}
              </button>

              {refinePrompt && (
                <button
                  onClick={() => setRefinePrompt('')}
                  disabled={isRefining}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Files:</span>
                <span>
                  {currentVersion.generated_code.files_to_modify.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Credits left:</span>
                <span>{currentVersion.remaining_credits}</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens:</span>
                <span>{currentVersion.token_usage}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3CodeGeneration
