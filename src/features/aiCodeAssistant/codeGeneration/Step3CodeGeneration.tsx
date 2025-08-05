import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import {
  refineCode,
  setCurrentVersion,
  clearError
} from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'
import LoadingModal from '@/shared/components/LoadingModal'

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
        steps={[
          'Analyzing requirements',
          'Processing context files',
          'Generating code structure',
          'Optimizing implementation',
          'Finalizing output'
        ]}
        currentStep={3}
        progress={65}
      />
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card bg-base-100 shadow-lg border border-error/20">
          <div className="card-body text-center py-8">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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

  const getQuickActionPrompt = (action: string) => {
    const prompts = {
      comments: 'Add comprehensive comments and documentation to the code',
      styling: 'Improve the styling and visual appearance of the components',
      performance: 'Optimize the code for better performance and efficiency',
      'error-handling': 'Add comprehensive error handling and validation',
      testing: 'Add unit tests and test cases for the components',
      accessibility:
        'Improve accessibility with ARIA labels and keyboard navigation',
      security: 'Add security improvements and input validation',
      mobile: 'Make the components mobile-responsive and touch-friendly'
    }
    return prompts[action as keyof typeof prompts] || action
  }

  const handleQuickAction = (action: string) => {
    const prompt = getQuickActionPrompt(action)
    setRefinePrompt(prompt)
  }

  return (
    <div className="space-y-8">
      {/* Refinement Loading Modal */}
      <LoadingModal
        isOpen={refining}
        title="Refining Code"
        message="AI is improving your code based on your feedback..."
        steps={[
          'Analyzing feedback',
          'Applying improvements',
          'Optimizing changes',
          'Finalizing refinements'
        ]}
        currentStep={2}
        progress={75}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                {notification.type === 'success' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              <span className="text-sm">{notification.message}</span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setNotification({ type: null, message: '' })}
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
          </div>
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-8">
        {/* Generated Code Section - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
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
              <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-primary mr-3 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <div className="text-sm text-primary">
                    <div className="font-semibold mb-2">AI Explanation</div>
                    <p className="leading-relaxed">
                      {currentVersion.explanation}
                    </p>
                    {currentVersion.additional_notes && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="font-medium mb-1">
                          Additional Notes:
                        </div>
                        <p className="text-primary/80">
                          {currentVersion.additional_notes}
                        </p>
                      </div>
                    )}
                    {currentVersion.refinement_prompt && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="font-medium mb-1">Last Refinement:</div>
                        <p className="text-primary/80">
                          {currentVersion.refinement_prompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Files */}
              <div className="space-y-6">
                {currentVersion.files_to_modify.map((file, index) => (
                  <div
                    key={index}
                    className="border border-base-300 rounded-lg overflow-hidden"
                  >
                    {/* File Header */}
                    <div className="bg-neutral text-neutral-content px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-neutral-content/10 rounded-md flex items-center justify-center">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {file.file_path.split('/').pop()}
                            </div>
                            <div className="text-xs opacity-70 flex items-center space-x-2">
                              <span
                                className={`badge badge-xs ${
                                  file.change_type === 'create'
                                    ? 'badge-primary'
                                    : file.change_type === 'modify'
                                    ? 'badge-primary'
                                    : 'badge-primary'
                                }`}
                              >
                                {file.change_type}
                              </span>
                              <span>{file.file_path}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => copyToClipboard(file.code)}
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
                      </div>
                    </div>

                    {/* File Description */}
                    <div className="px-4 py-2 bg-base-100 border-b border-base-300">
                      <p className="text-sm text-base-content/70">
                        {file.description}
                      </p>
                    </div>

                    {/* Code Content */}
                    <div className="bg-base-200">
                      <pre className="px-4 py-3 overflow-x-auto text-sm max-h-96 text-base-content">
                        <code>{file.code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Refinement Panel - Takes 1 column */}
        <div className="space-y-6">
          {/* Refinement Input */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-primary"
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
                      Refine
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline btn-primary"
                  onClick={() => setRefinePrompt('')}
                  disabled={refining}
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-6">
              <h4 className="font-semibold mb-4 flex items-center">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Quick Actions
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: 'comments', label: 'Add Comments', icon: '📝' },
                  { key: 'styling', label: 'Improve Styling', icon: '🎨' },
                  {
                    key: 'performance',
                    label: 'Optimize Performance',
                    icon: '⚡'
                  },
                  {
                    key: 'error-handling',
                    label: 'Error Handling',
                    icon: '🛡️'
                  },
                  { key: 'testing', label: 'Add Tests', icon: '🧪' },
                  { key: 'accessibility', label: 'Accessibility', icon: '♿' },
                  { key: 'security', label: 'Security', icon: '🔒' },
                  { key: 'mobile', label: 'Mobile Ready', icon: '📱' }
                ].map((action) => (
                  <button
                    key={action.key}
                    className="btn btn-outline btn-primary btn-sm justify-start"
                    onClick={() => handleQuickAction(action.key)}
                    disabled={refining}
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Version History */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-6">
              <h4 className="font-semibold mb-4 flex items-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Version History
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedCodeVersions.length > 0 ? (
                  [...generatedCodeVersions].reverse().map((version, index) => {
                    const isLatest = version.id === currentVersion?.id
                    const { date, time } = formatTimestamp(version.timestamp)

                    return (
                      <div
                        key={version.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isLatest
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-base-300 bg-base-50 hover:border-primary/20'
                        }`}
                        onClick={() => handleVersionChange(version.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`font-semibold text-sm ${
                              isLatest ? 'text-primary' : 'text-base-content'
                            }`}
                          >
                            {version.version}
                          </span>
                          {version.refinement_prompt && (
                            <span className="badge badge-xs badge-primary">
                              Refined
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-base-content/60 mb-2 line-clamp-2">
                          {version.explanation.substring(0, 100)}
                          {version.explanation.length > 100 ? '...' : ''}
                        </p>
                        <div className="text-xs text-base-content/50">
                          {date} at {time}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-6 text-base-content/60">
                    <div className="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">No version history yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3CodeGeneration
