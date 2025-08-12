import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Move,
  AlertOctagon,
  Clipboard,
  Copy,
  RefreshCw,
  Lightbulb,
  Trash2
} from 'lucide-react'

import {
  refineCode,
  setCurrentVersion,
  clearError
} from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'
import LoadingModal from '@/shared/components/LoadingModal'
import CodeFileCard from './components/CodeFileCard'
import FileExplorer from './components/FileExplorer'
import MonacoCodeViewer from './components/MonacoCodeViewer'

interface Step3Props {
  refinePrompt: string
  setRefinePrompt: (value: string) => void
}

const Step3CodeGeneration: React.FC<Step3Props> = ({
  refinePrompt,
  setRefinePrompt
}) => {
  const dispatch = useAppDispatch()
  const { generatedCodeVersions, currentVersion, loading, error, refining } =
    useAppSelector((state) => state.codeGeneration)

  // Get context from other slices for refinement
  const { selectedRelevantFiles, manuallyAddedFiles, projectStructure } =
    useAppSelector((state) => state.promptClarification)

  // Local state for notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // File explorer state
  const [selectedFile, setSelectedFile] = useState<{
    path: string
    name: string
  } | null>(null)

  // Get project path from projectStructure
  const projectPath = projectStructure?.root

  // Clear notification after 5 seconds
  React.useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Clear error when component unmounts or when starting new refinement
  React.useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Loading modal for code generation
  if (loading) {
    return (
      <LoadingModal
        isOpen={true}
        title="Generating Code"
        message="AI is creating optimized code based on your requirements..."
      />
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-lg border border-error/20">
          <div className="card-body text-center py-8">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-lg font-semibold text-error mb-2">
              Generation Failed
            </h3>
            <p className="text-sm text-base-content/60 mb-4">{error}</p>
            <button
              className="btn btn-outline btn-error"
              onClick={() => dispatch(clearError())}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentVersion) {
    return (
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body text-center py-12">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No Code Generated
          </h3>
          <p className="text-base-content/60">
            Please complete the previous steps to generate code.
          </p>
        </div>
      </div>
    )
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setNotification({
        type: 'success',
        message: 'Code copied to clipboard!'
      })
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to copy to clipboard'
      })
    }
  }

  // Updated file action handler - now called after diff confirmation
  const handleFileAction = async (file: any) => {
    try {
      if (file.change_type === 'create') {
        // For create: let user select where to save the new file
        const result = await window.electronAPI.selectFolder()
        if (!result) return

        const fileName = file.file_path.split('/').pop() || 'newfile.js'
        const newFilePath = `${result}/${fileName}`

        // Write the new file
        await window.electronAPI.writeFile(newFilePath, file.code)

        setNotification({
          type: 'success',
          message: `File created successfully at ${newFilePath}`
        })
      } else if (file.change_type === 'modify') {
        // For modify: directly update the file using the existing absolute path
        try {
          // Since we already have the absolute file path, directly write to it
          await window.electronAPI.writeFile(file.file_path, file.code)

          setNotification({
            type: 'success',
            message: `File updated successfully: ${file.file_path
              .split('/')
              .pop()}`
          })
        } catch (error) {
          // If write fails (maybe directory doesn't exist), create the directory structure
          console.warn(
            'Direct write failed, attempting to create directory structure:',
            error
          )
          await window.electronAPI.writeFile(file.file_path, file.code)

          setNotification({
            type: 'success',
            message: `File created at: ${file.file_path.split('/').pop()}`
          })
        }
      }
    } catch (error) {
      console.error('File action error:', error)
      setNotification({
        type: 'error',
        message: `Failed to ${file.change_type} file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      })
    }
  }

  const handleRefineCode = async () => {
    if (!refinePrompt.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter refinement instructions.'
      })
      return
    }

    if (!currentVersion) {
      setNotification({
        type: 'error',
        message: 'No current version to refine.'
      })
      return
    }

    // Clear any previous errors
    dispatch(clearError())

    try {
      await dispatch(
        refineCode({
          currentVersion,
          refinementFeedback: refinePrompt,
          selectedRelevantFiles: selectedRelevantFiles || [],
          manuallyAddedFiles: manuallyAddedFiles || [],
          projectStructure: projectStructure || {
            type: 'unknown',
            root: '.',
            structure: { root_files: [] },
            conventions: {},
            framework: {}
          }
        })
      ).unwrap()

      // Clear the refinement prompt after successful refinement
      setRefinePrompt('')
      setNotification({
        type: 'success',
        message: 'Code refined successfully!'
      })
    } catch (error) {
      console.error('Failed to refine code:', error)
      setNotification({
        type: 'error',
        message: `Failed to refine code: ${
          error instanceof Error ? error.message : 'Unknown error occurred'
        }`
      })
    }
  }

  const handleVersionChange = (versionId: string) => {
    dispatch(setCurrentVersion(versionId))
    setNotification({
      type: 'success',
      message: 'Version switched successfully!'
    })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const handleFileSelect = (filePath: string, fileName: string) => {
    setSelectedFile({ path: filePath, name: fileName })
  }

  const handleCloseFileViewer = () => {
    setSelectedFile(null)
  }

  return (
    <div className="space-y-8">
      {/* Refinement Loading Modal */}
      <LoadingModal
        isOpen={refining}
        title="Refining Code"
        message="AI is improving your code based on your feedback..."
      />

      {/* Notification Toast */}
      {notification.type && (
        <div
          className={`alert shadow-lg ${
            notification.type === 'success' ? 'alert-success' : 'alert-error'
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="stroke-current flex-shrink-0 h-6 w-6 mr-2" />
              ) : (
                <XCircle className="stroke-current flex-shrink-0 h-6 w-6 mr-2" />
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

      <div className="grid xl:grid-cols-2 gap-8">
        {/* Generated Code Section - Now takes 1 column (50%) */}
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <Move className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-base-content">
                      Generated Code
                    </h3>
                    <p className="text-sm text-base-content/60">
                      {currentVersion.files_to_modify.length} files generated
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-outline btn-primary btn-sm"
                  onClick={() =>
                    copyToClipboard(
                      currentVersion.files_to_modify
                        .map((f) => f.code)
                        .join('\n\n')
                    )
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </button>
              </div>

              {/* Version Selector */}
              {generatedCodeVersions.length > 1 && (
                <div className="mb-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Version History
                      </span>
                      <span className="label-text-alt badge badge-primary badge-sm">
                        {generatedCodeVersions.length} versions
                      </span>
                    </label>
                    <select
                      className="select select-bordered focus:select-primary"
                      value={currentVersion.id}
                      onChange={(e) => handleVersionChange(e.target.value)}
                      disabled={refining}
                    >
                      {[...generatedCodeVersions].reverse().map((version) => {
                        const { date, time } = formatTimestamp(
                          version.timestamp
                        )
                        return (
                          <option key={version.id} value={version.id}>
                            {version.version} - {date} at {time}
                            {version.refinement_prompt ? ' (Refined)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
              )}

              {/* AI Explanation */}
              <div className="mb-6 bg-base-200 rounded-lg border border-primary/20 p-5">
                <div className="flex items-start mb-3">
                  <Lightbulb className="w-6 h-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <h3 className="text-lg font-semibold">AI Explanation</h3>
                </div>

                <div className="bg-base-200 border border-base-300 rounded-lg px-4 py-3 mb-3">
                  <p className="text-sm leading-relaxed text-base-content/80 whitespace-pre-wrap">
                    {currentVersion.explanation || 'No explanation provided.'}{' '}
                  </p>
                </div>

                {currentVersion.additional_notes && (
                  <div className="mt-4 border-t border-base-300 pt-3">
                    <h4 className="text-md font-medium text-base-content mb-2">
                      Additional Notes
                    </h4>
                    <div className="text-base-content/70 text-sm leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap px-2">
                      {currentVersion.additional_notes}
                    </div>
                  </div>
                )}

                {currentVersion.refinement_prompt && (
                  <div className="mt-4 border-t border-base-300 pt-3">
                    <h4 className="text-md font-medium text-base-content mb-2">
                      Last Refinement
                    </h4>
                    <div className="text-base-content/70 text-sm leading-relaxed whitespace-pre-wrap px-2">
                      {currentVersion.refinement_prompt}
                    </div>
                  </div>
                )}
              </div>

              {/* Code Files */}
              <div className="space-y-6">
                {currentVersion.files_to_modify.map((file, index) => (
                  <CodeFileCard
                    key={index}
                    file={file}
                    onFileAction={handleFileAction}
                    onCopy={copyToClipboard}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Now also takes 1 column (50%) */}
        <div className="space-y-6">
          {/* Refinement Input */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-base-content">
                    Refine Code
                  </h3>
                  <p className="text-sm text-base-content/60">
                    Improve and customize
                  </p>
                </div>
              </div>

              <div className="form-control mb-4">
                <textarea
                  className="textarea textarea-bordered h-32 text-sm resize-none focus:textarea-primary transition-colors"
                  placeholder="e.g., Add loading states, improve error handling, optimize performance, add TypeScript types..."
                  value={refinePrompt}
                  onChange={(e) =>
                    setRefinePrompt(e.target.value.slice(0, 500))
                  }
                  disabled={refining}
                  maxLength={500}
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/50">
                    {refinePrompt.length}/500
                  </span>
                  <span className="label-text-alt text-base-content/50">
                    💡 Be specific for better results
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleRefineCode}
                  disabled={refining || !refinePrompt.trim()}
                >
                  {refining ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Refining...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refine
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline btn-primary"
                  onClick={() => setRefinePrompt('')}
                  disabled={refining}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* File Explorer */}
          <FileExplorer
            projectPath={projectPath}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile?.path}
          />

          {/* Monaco Code Viewer */}
          <MonacoCodeViewer
            filePath={selectedFile?.path}
            fileName={selectedFile?.name}
            onClose={handleCloseFileViewer}
          />
        </div>
      </div>
    </div>
  )
}

export default Step3CodeGeneration
