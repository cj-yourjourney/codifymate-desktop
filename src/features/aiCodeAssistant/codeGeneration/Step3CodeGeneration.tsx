import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import {
  refineCode,
  setCurrentVersion,
  clearError
} from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-4">Generating code...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
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
          <div>
            <h3 className="font-bold">Error occurred!</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => dispatch(clearError())}
        >
          Clear Error
        </button>
      </div>
    )
  }

  if (!currentVersion) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No code generated yet. Please complete the previous steps first.
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

  const formatVersionHistory = () => {
    // Reverse the array to show latest version first
    return [...generatedCodeVersions].reverse().map((version, index) => {
      const isLatest = version.id === currentVersion?.id
      const alertType = isLatest ? 'alert-success' : 'alert-info'
      const { date, time } = formatTimestamp(version.timestamp)

      return (
        <div key={version.id} className={`alert ${alertType} alert-sm`}>
          <div className="text-sm">
            <span className="font-semibold">{version.version}:</span>{' '}
            {version.explanation.substring(0, 80)}
            {version.explanation.length > 80 ? '...' : ''}
            <div className="text-xs opacity-70 mt-1">
              {date} at {time}
              {version.refinement_prompt && (
                <span className="ml-2 badge badge-xs">Refined</span>
              )}
            </div>
          </div>
        </div>
      )
    })
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
    <div className="space-y-4">
      {/* Notification Toast */}
      {notification.type && (
        <div
          className={`alert ${
            notification.type === 'success' ? 'alert-success' : 'alert-error'
          } alert-sm`}
        >
          <div className="flex justify-between items-center w-full">
            <span>{notification.message}</span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => setNotification({ type: null, message: '' })}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Code</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() =>
                copyToClipboard(
                  currentVersion.files_to_modify.map((f) => f.code).join('\n\n')
                )
              }
            >
              📋 Copy All
            </button>
          </div>

          {/* Version Selector */}
          {generatedCodeVersions.length > 1 && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Version History</span>
                <span className="label-text-alt text-xs">
                  {generatedCodeVersions.length} version
                  {generatedCodeVersions.length !== 1 ? 's' : ''}
                </span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={currentVersion.id}
                onChange={(e) => handleVersionChange(e.target.value)}
                disabled={refining}
              >
                {[...generatedCodeVersions].reverse().map((version) => {
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

          <div className="alert alert-info">
            <div>
              <h4 className="font-semibold mb-2">AI Explanation</h4>
              <p className="text-sm opacity-90">{currentVersion.explanation}</p>
              {currentVersion.additional_notes && (
                <div className="mt-2">
                  <h5 className="font-medium text-xs opacity-75">
                    Additional Notes:
                  </h5>
                  <p className="text-xs opacity-70">
                    {currentVersion.additional_notes}
                  </p>
                </div>
              )}
              {currentVersion.refinement_prompt && (
                <div className="mt-2">
                  <h5 className="font-medium text-xs opacity-75">
                    Last Refinement:
                  </h5>
                  <p className="text-xs opacity-70">
                    {currentVersion.refinement_prompt}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {currentVersion.files_to_modify.map((file, index) => (
              <div key={index} className="mockup-code">
                <div className="flex items-center justify-between px-6 py-2 bg-neutral text-neutral-content">
                  <div className="flex items-center">
                    <span className="mr-2">📄</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {file.file_path.split('/').pop()}
                      </span>
                      <span className="text-xs opacity-70">
                        {file.change_type} • {file.file_path}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => copyToClipboard(file.code)}
                  >
                    📋
                  </button>
                </div>
                <div className="px-6 py-2 bg-base-300">
                  <p className="text-xs text-base-content/70">
                    {file.description}
                  </p>
                </div>
                <pre className="px-6 py-4 overflow-x-auto text-sm max-h-96">
                  <code>{file.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Refine & Improve</h3>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Feedback and Refinement Instructions
              </span>
              <span className="label-text-alt text-xs">
                {refinePrompt.length}/500
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-32 resize-none"
              placeholder="e.g., Add loading states, improve error handling, optimize performance..."
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value.slice(0, 500))}
              disabled={refining}
              maxLength={500}
            />
            <div className="label">
              <span className="label-text-alt text-xs opacity-70">
                💡 Tip: Be specific about what you want to change or improve
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="btn btn-warning flex-1"
              onClick={handleRefineCode}
              disabled={refining || !refinePrompt.trim()}
            >
              {refining ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Refining...
                </>
              ) : (
                <>🔄 Refine Code</>
              )}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setRefinePrompt('')}
              disabled={refining}
            >
              ↻ Clear
            </button>
          </div>

          <div className="divider"></div>
          <div>
            <h4 className="font-semibold mb-3">Version History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {generatedCodeVersions.length > 0 ? (
                formatVersionHistory()
              ) : (
                <div className="text-center py-4 text-base-content/60 text-sm">
                  No version history yet
                </div>
              )}
            </div>
          </div>

          <div className="divider"></div>
          <div>
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('comments')}
                disabled={refining}
              >
                📝 Add Comments
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('styling')}
                disabled={refining}
              >
                🎨 Improve Styling
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('performance')}
                disabled={refining}
              >
                ⚡ Optimize Performance
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('error-handling')}
                disabled={refining}
              >
                🛡️ Add Error Handling
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('testing')}
                disabled={refining}
              >
                🧪 Add Tests
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('accessibility')}
                disabled={refining}
              >
                ♿ Accessibility
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('security')}
                disabled={refining}
              >
                🔒 Security
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => handleQuickAction('mobile')}
                disabled={refining}
              >
                📱 Mobile Ready
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step3CodeGeneration
