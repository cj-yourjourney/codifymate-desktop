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

  // Mock assessment data
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
  const [showCustomInput, setShowCustomInput] = useState(false)
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
    await new Promise((resolve) => setTimeout(resolve, 1500))
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
      setShowCustomInput(false)
    }
  }

  const totalSelected = selectedFiles.length
  const customFiles = selectedFiles.filter((f) => !f.isAISuggested)

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts':
        return '🔷'
      case 'json':
        return '📋'
      case 'css':
        return '🎨'
      case 'md':
        return '📝'
      default:
        return '📄'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Add Reference Files
          </h1>
          <p className="text-gray-600">
            Select files to provide context for better code generation
          </p>
        </div>

        {/* Assessment Result */}
        {assessment && (
          <div
            className={`rounded-xl p-6 mb-8 border-l-4 ${
              assessment.score >= 7
                ? 'bg-green-50 border-green-400'
                : 'bg-amber-50 border-amber-400'
            }`}
          >
            <div className="flex items-start">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${
                  assessment.score >= 7 ? 'bg-green-500' : 'bg-amber-500'
                }`}
              >
                {assessment.score}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Assessment Complete
                </h3>
                <p className="text-gray-700">{assessment.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* File Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Reference Files
              </h3>
              <div className="text-sm text-gray-500">
                {totalSelected} file{totalSelected !== 1 ? 's' : ''} selected
              </div>
            </div>

            {/* AI Suggested Files */}
            <div className="space-y-3 mb-6">
              {aiSuggestedFiles.map((filePath, index) => {
                const isSelected = selectedFiles.some(
                  (f) => f.path === filePath
                )
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFileToggle(filePath, true)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">
                          {getFileIcon(filePath)}
                        </span>
                        <div>
                          <div className="font-mono text-sm font-medium text-gray-900">
                            {filePath.split('/').pop()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {filePath}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFileToggle(filePath, true)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Files Section */}
            {customFiles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Custom Files
                </h4>
                <div className="space-y-2">
                  {customFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-blue-300 bg-blue-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">
                            {getFileIcon(file.path)}
                          </span>
                          <div className="font-mono text-sm">{file.path}</div>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedFiles((prev) =>
                              prev.filter((f) => f.path !== file.path)
                            )
                          }
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom File */}
            {showCustomInput ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="/src/components/MyComponent.tsx"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customFilePath}
                  onChange={(e) => setCustomFilePath(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomFile()}
                  autoFocus
                />
                <button
                  onClick={handleAddCustomFile}
                  disabled={!customFilePath.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomFilePath('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomInput(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add custom file
              </button>
            )}
          </div>

          {/* Improvement Suggestions */}
          {assessment &&
            assessment.score < 7 &&
            assessment.suggestedFiles &&
            assessment.suggestedFiles.length > 0 && (
              <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3">
                  💡 Suggested Improvements
                </h4>
                <div className="space-y-3">
                  {assessment.suggestedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div>
                        <div className="font-mono text-sm font-medium">
                          {file.path}
                        </div>
                        <div className="text-xs text-gray-600">
                          {file.reason}
                        </div>
                      </div>
                      <button
                        onClick={() => handleFileToggle(file.path, false)}
                        disabled={selectedFiles.some(
                          (f) => f.path === file.path
                        )}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          selectedFiles.some((f) => f.path === file.path)
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                      >
                        {selectedFiles.some((f) => f.path === file.path)
                          ? 'Added'
                          : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={handleAssessment}
              disabled={isAssessing || totalSelected === 0}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                isAssessing
                  ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                  : totalSelected === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : assessment && assessment.score >= 7
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAssessing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Assessing Files...
                </span>
              ) : assessment && assessment.score >= 7 ? (
                '✨ Continue to Generate Code'
              ) : (
                '🔍 Assess File Selection'
              )}
            </button>
          </div>

          {totalSelected === 0 && (
            <p className="text-center text-sm text-gray-500 mt-2">
              Select at least one file to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2PromptClarification
