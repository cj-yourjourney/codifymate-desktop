import React, { useState } from 'react'

// Mock data types
interface ReferenceFileAssessment {
  score: number
  message: string
  suggestedFiles?: Array<{
    path: string
    reason: string
  }>
}

interface SelectedFile {
  path: string
  isAISuggested: boolean
}

const Step2PromptClarification: React.FC = () => {
  // Mock data for AI suggested files
  const aiSuggestedFiles = [
    '/src/components/Button/Button.tsx',
    '/src/components/Input/Input.tsx',
    '/src/hooks/useApi.ts',
    '/src/utils/validation.ts',
    '/package.json',
    '/tsconfig.json'
  ]

  // Mock assessment data - randomly choose between low and high score
  const mockAssessments: ReferenceFileAssessment[] = [
    {
      score: 5,
      message:
        'Your reference files need improvement to provide better context for AI code generation.',
      suggestedFiles: [
        {
          path: '/src/types/api.ts',
          reason: 'Type definitions will help generate properly typed code'
        },
        {
          path: '/src/config/constants.ts',
          reason: 'Configuration constants ensure consistent implementation'
        },
        {
          path: '/src/styles/globals.css',
          reason: 'Styling patterns will guide UI component generation'
        },
        {
          path: '/README.md',
          reason: 'Project documentation provides context about architecture'
        }
      ]
    },
    {
      score: 9,
      message:
        'Excellent reference file selection! Your files provide comprehensive context for AI code generation.',
      suggestedFiles: []
    }
  ]

  // State management
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([
    { path: '/src/components/Button/Button.tsx', isAISuggested: true },
    { path: '/src/hooks/useApi.ts', isAISuggested: true }
  ])
  const [assessment, setAssessment] = useState<ReferenceFileAssessment | null>(
    null
  )
  const [isAssessing, setIsAssessing] = useState(false)
  const [showFileDialog, setShowFileDialog] = useState(false)
  const [customFilePath, setCustomFilePath] = useState('')

  // Handle file selection toggle
  const handleFileToggle = (
    filePath: string,
    isAISuggested: boolean = true
  ) => {
    setSelectedFiles((prev) => {
      const exists = prev.find((f) => f.path === filePath)
      if (exists) {
        return prev.filter((f) => f.path !== filePath)
      } else {
        return [...prev, { path: filePath, isAISuggested }]
      }
    })
  }

  // Handle assessment
  const handleAssessment = async () => {
    setIsAssessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Randomly select assessment (weighted towards improvement for demo)
    const selectedAssessment =
      Math.random() > 0.3 ? mockAssessments[0] : mockAssessments[1]
    setAssessment(selectedAssessment)
    setIsAssessing(false)
  }

  // Handle adding custom file
  const handleAddCustomFile = () => {
    if (customFilePath.trim()) {
      handleFileToggle(customFilePath.trim(), false)
      setCustomFilePath('')
      setShowFileDialog(false)
    }
  }

  // Handle removing custom file
  const handleRemoveCustomFile = (filePath: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.path !== filePath))
  }

  const selectedAIFiles = selectedFiles.filter((f) => f.isAISuggested)
  const selectedCustomFiles = selectedFiles.filter((f) => !f.isAISuggested)
  const totalSelected = selectedFiles.length

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-base-content">
              Select Reference Files
            </h2>
            <p className="text-base-content/60">
              Choose files that provide context for better AI code generation
            </p>
          </div>
          <div className="badge badge-primary badge-lg">
            {totalSelected} files selected
          </div>
        </div>

        {/* Assessment Section */}
        {assessment && (
          <div
            className={`alert ${
              assessment.score >= 7 ? 'alert-success' : 'alert-warning'
            } shadow-lg mb-4`}
          >
            <div className="flex items-start w-full">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                    assessment.score >= 7
                      ? 'bg-success text-success-content'
                      : 'bg-warning text-warning-content'
                  }`}
                >
                  {assessment.score}
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-1">
                    Reference File Assessment
                  </div>
                  <div className="text-sm opacity-90">{assessment.message}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested improvements for low score */}
        {assessment &&
          assessment.score < 7 &&
          assessment.suggestedFiles &&
          assessment.suggestedFiles.length > 0 && (
            <div className="card bg-base-100 shadow-lg border border-warning/30 mb-4">
              <div className="card-body p-4">
                <h4 className="font-semibold text-warning mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Recommended Additional Files
                </h4>
                <div className="space-y-2">
                  {assessment.suggestedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-warning/5 rounded-lg border border-warning/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-base-content break-all">
                          {file.path}
                        </div>
                        <div className="text-xs text-base-content/60 mt-1">
                          {file.reason}
                        </div>
                      </div>
                      <button
                        className="btn btn-outline btn-warning btn-xs ml-3"
                        onClick={() => handleFileToggle(file.path, false)}
                        disabled={selectedFiles.some(
                          (f) => f.path === file.path
                        )}
                      >
                        {selectedFiles.some((f) => f.path === file.path)
                          ? 'Added'
                          : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Main Content - Left/Right Panels */}
      <div className="grid lg:grid-cols-2 gap-6 h-full">
        {/* Left Panel - File Selection */}
        <div className="space-y-6">
          {/* AI Suggested Files */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-primary flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI Suggested Files
                </h3>
                <div className="badge badge-outline">
                  {selectedAIFiles.length} of {aiSuggestedFiles.length}
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {aiSuggestedFiles.map((filePath, index) => {
                  const isSelected = selectedFiles.some(
                    (f) => f.path === filePath
                  )
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-base-300 hover:border-primary/20 hover:bg-base-50'
                      }`}
                      onClick={() => handleFileToggle(filePath, true)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-base-content break-all">
                              {filePath}
                            </div>
                            <div className="text-xs text-base-content/50">
                              {filePath.split('/').pop()}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleFileToggle(filePath, true)}
                          className="checkbox checkbox-primary checkbox-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Manually Added Files */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Additional Files
                </h3>
                <button
                  className="btn btn-outline btn-secondary btn-sm"
                  onClick={() => setShowFileDialog(true)}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add File
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedCustomFiles.length > 0 ? (
                  selectedCustomFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-secondary/30 bg-secondary/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="w-8 h-8 bg-secondary/10 rounded-md flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-secondary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-base-content break-all">
                              {file.path}
                            </div>
                            <div className="text-xs text-base-content/50">
                              Manually added
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          onClick={() => handleRemoveCustomFile(file.path)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
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
                  ))
                ) : (
                  <div className="text-center py-8 text-base-content/60">
                    <div className="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm mb-2">No additional files added</p>
                    <p className="text-xs text-base-content/40">
                      Add files not suggested by AI
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Assessment & Actions */}
        <div className="space-y-6">
          {/* Assessment Action */}
          <div className="card bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg border border-primary/20">
            <div className="card-body p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-base-content mb-2">
                Reference File Assessment
              </h3>

              <p className="text-base-content/60 mb-6">
                Get AI feedback on your file selection to ensure optimal code
                generation
              </p>

              <button
                className={`btn w-full ${
                  !assessment || assessment.score < 7
                    ? 'btn-primary'
                    : 'btn-success'
                } ${isAssessing ? 'loading' : ''}`}
                onClick={handleAssessment}
                disabled={isAssessing || totalSelected === 0}
              >
                {isAssessing ? (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                ) : (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                )}
                {!assessment || assessment.score < 7
                  ? 'Assess Reference Files'
                  : 'Generate Code'}
              </button>

              {totalSelected === 0 && (
                <p className="text-warning text-xs mt-2">
                  Please select at least one file to assess
                </p>
              )}
            </div>
          </div>

          {/* File Summary */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold text-base-content mb-4">
                Selection Summary
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-primary mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span className="text-sm">AI Suggested</span>
                  </div>
                  <span className="badge badge-primary">
                    {selectedAIFiles.length}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-secondary mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm">Manually Added</span>
                  </div>
                  <span className="badge badge-secondary">
                    {selectedCustomFiles.length}
                  </span>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between items-center p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-accent mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="text-sm font-semibold">Total Files</span>
                  </div>
                  <span className="badge badge-accent badge-lg">
                    {totalSelected}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Results Details */}
          {assessment && assessment.score >= 7 && (
            <div className="card bg-success/5 shadow-lg border border-success/30">
              <div className="card-body p-4">
                <h4 className="font-semibold text-success mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Great File Selection!
                </h4>
                <div className="text-sm text-success/80 space-y-2">
                  <p>
                    Your selected files provide comprehensive context including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Component structure and patterns</li>
                    <li>Type definitions and interfaces</li>
                    <li>Project configuration and dependencies</li>
                    <li>Utility functions and hooks</li>
                  </ul>
                  <p className="font-medium mt-3">
                    Ready to generate high-quality code!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add File Dialog */}
      {showFileDialog && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Reference File</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">File Path</span>
              </label>
              <input
                type="text"
                placeholder="/src/components/MyComponent.tsx"
                className="input input-bordered w-full"
                value={customFilePath}
                onChange={(e) => setCustomFilePath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomFile()}
              />
              <label className="label">
                <span className="label-text-alt">
                  Enter the absolute path to your file
                </span>
              </label>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowFileDialog(false)
                  setCustomFilePath('')
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddCustomFile}
                disabled={!customFilePath.trim()}
              >
                Add File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Step2PromptClarification
