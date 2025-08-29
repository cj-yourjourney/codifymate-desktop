import React, { useState } from 'react'
import {
  Code,
  RefreshCw,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  FileText,
  Lightbulb,
  Clock,
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

  const [refinePrompt, setRefinePrompt] = useState('')
  const [expandedFiles, setExpandedFiles] = useState(new Set(['0']))
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const currentVersion =
    versions.find((v) => v.id === currentVersionId) ||
    versions[versions.length - 1]

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const handleRefine = async () => {
    if (!refinePrompt.trim()) {
      showNotification('Please enter refinement instructions', 'error')
      return
    }

    if (!currentVersion) {
      showNotification('No code version available to refine', 'error')
      return
    }

    dispatch(
      refineCode({
        refinementPrompt: refinePrompt.trim(),
        currentCode: currentVersion.generated_code
      })
    )

    setRefinePrompt('')
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
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
      showNotification('Copied to clipboard!', 'success')
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
    showNotification('File downloaded!', 'success')
  }

  // Show loading state if no versions available yet
  if (versions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Code
          </h3>
          <p className="text-gray-600">
            Please wait while we generate your code...
          </p>
        </div>
      </div>
    )
  }

  if (!currentVersion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Code Generated
          </h3>
          <p className="text-gray-600">Please go back and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
          <Code className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generated Code</h1>
          <p className="text-gray-600">Review and refine your code</p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-red-700">{error}</span>
          <X
            className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
            onClick={() => dispatch(clearError())}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content - Code Output */}
        <div className="lg:col-span-3 space-y-6">
          {/* Version Selector */}
          {versions.length > 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <h3 className="font-semibold text-gray-900">
                    Version History
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  {versions.length} versions
                </span>
              </div>

              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={currentVersionId || ''}
                onChange={(e) => dispatch(setCurrentVersion(e.target.value))}
              >
                {versions.map((version) => {
                  const { date, time } = formatTimestamp(version.timestamp)
                  return (
                    <option key={version.id} value={version.id}>
                      {version.version} - {date} at {time}
                      {version.refinement_prompt ? ' (Refined)' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* AI Explanation */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  AI Explanation
                </h3>
                <p className="text-gray-700 mb-3">
                  {currentVersion.generated_code.explanation}
                </p>

                {currentVersion.refinement_prompt && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Last Refinement
                    </h4>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                      {currentVersion.refinement_prompt}
                    </p>
                  </div>
                )}

                {currentVersion.generated_code.additional_notes && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-1">
                      Additional Notes
                    </h4>
                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                      {currentVersion.generated_code.additional_notes}
                    </p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between text-xs text-gray-500">
                  <span>Credits used: {currentVersion.credits_used}</span>
                  <span>Model: {currentVersion.model_used}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Code Files */}
          <div className="space-y-4">
            {currentVersion.generated_code.files_to_modify.map(
              (file, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleFileExpanded(index)}
                          className="mr-2 p-1 rounded hover:bg-gray-200"
                        >
                          {expandedFiles.has(index.toString()) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <FileText className="w-4 h-4 text-gray-500 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {file.file_path.split('/').pop()}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {file.file_path}
                          </p>
                          {file.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            file.change_type === 'create'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {file.change_type}
                        </span>

                        <button
                          onClick={() => copyToClipboard(file.code)}
                          className="p-1 text-gray-500 hover:text-gray-700 rounded"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => downloadFile(file)}
                          className="p-1 text-gray-500 hover:text-gray-700 rounded"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedFiles.has(index.toString()) && (
                    <div className="p-4">
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-sm">
                        <code>{file.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Sidebar - Refinement Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refine Code
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refinement Instructions
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="e.g., Add error handling, improve styling, add TypeScript..."
                  value={refinePrompt}
                  onChange={(e) =>
                    setRefinePrompt(e.target.value.slice(0, 500))
                  }
                  disabled={isRefining}
                  maxLength={500}
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{refinePrompt.length}/500</span>
                </div>
              </div>

              <button
                className="w-full bg-blue-600 text-white font-medium py-2 px-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                onClick={handleRefine}
                disabled={isRefining || !refinePrompt.trim()}
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
                  className="w-full text-gray-500 font-medium py-2 px-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                  onClick={() => setRefinePrompt('')}
                  disabled={isRefining}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Quick Actions
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() =>
                    copyToClipboard(
                      currentVersion.generated_code.files_to_modify
                        .map((f) => f.code)
                        .join('\n\n')
                    )
                  }
                  className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex items-center"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy All Code
                </button>
                <button
                  onClick={() => {
                    currentVersion.generated_code.files_to_modify.forEach(
                      (file) => downloadFile(file)
                    )
                  }}
                  className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex items-center"
                >
                  <Download className="w-3 h-3 mr-2" />
                  Download All Files
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Files:</span>
                <span>
                  {currentVersion.generated_code.files_to_modify.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Credits:</span>
                <span>{currentVersion.remaining_credits} remaining</span>
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
