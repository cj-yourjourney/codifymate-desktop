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
        },
        {
          path: '/src/styles/globals.css',
          reason: 'Styling patterns will guide UI component generation'
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
  const [activeTab, setActiveTab] = useState<'suggested' | 'custom'>(
    'suggested'
  )

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
      setShowFileDialog(false)
    }
  }

  const selectedAIFiles = selectedFiles.filter((f) => f.isAISuggested)
  const selectedCustomFiles = selectedFiles.filter((f) => !f.isAISuggested)
  const totalSelected = selectedFiles.length

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
       

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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
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

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* File Selection Panel */}
          <div className="lg:col-span-2">
            {/* Improvement Suggestions */}
            {assessment &&
              assessment.score < 7 &&
              assessment.suggestedFiles &&
              assessment.suggestedFiles.length > 0 && (
                <div className="mt-6 bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="flex items-center font-semibold text-amber-800 mb-4">
                    💡 Recommended Files to Add
                  </h3>
                  <div className="space-y-3">
                    {assessment.suggestedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-3">
                            {getFileIcon(file.path)}
                          </span>
                          <div>
                            <div className="font-mono text-sm font-medium">
                              {file.path}
                            </div>
                            <div className="text-xs text-gray-600">
                              {file.reason}
                            </div>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'suggested'
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('suggested')}
                  >
                    <span className="flex items-center">
                      🤖 AI Suggested ({aiSuggestedFiles.length})
                    </span>
                  </button>
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'custom'
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('custom')}
                  >
                    <span className="flex items-center">
                      👤 Custom Files ({selectedCustomFiles.length})
                    </span>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'suggested' ? (
                  <div className="space-y-3">
                    {aiSuggestedFiles.map((filePath, index) => {
                      const isSelected = selectedFiles.some(
                        (f) => f.path === filePath
                      )
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'border-blue-300 bg-blue-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleFileToggle(filePath, true)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">
                                {getFileIcon(filePath)}
                              </span>
                              <div>
                                <div className="font-mono text-sm font-medium text-gray-900">
                                  {filePath.split('/').pop()}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {filePath}
                                </div>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleFileToggle(filePath, true)}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">
                        Your Custom Files
                      </h3>
                      <button
                        onClick={() => setShowFileDialog(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        + Add File
                      </button>
                    </div>

                    {selectedCustomFiles.length > 0 ? (
                      selectedCustomFiles.map((file, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">
                                {getFileIcon(file.path)}
                              </span>
                              <div>
                                <div className="font-mono text-sm font-medium text-gray-900">
                                  {file.path.split('/').pop()}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {file.path}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setSelectedFiles((prev) =>
                                  prev.filter((f) => f.path !== file.path)
                                )
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📁</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No custom files added
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Add your own reference files to provide additional
                          context
                        </p>
                        <button
                          onClick={() => setShowFileDialog(true)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add Your First File
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Selection Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Files</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {totalSelected}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">🤖 AI Suggested</span>
                    <span className="font-medium">
                      {selectedAIFiles.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">👤 Custom Files</span>
                    <span className="font-medium">
                      {selectedCustomFiles.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Ready to Assess?</h3>
                <p className="text-sm opacity-90 mb-6">
                  Get AI feedback on your file selection to ensure optimal code
                  generation
                </p>

                <button
                  onClick={handleAssessment}
                  disabled={isAssessing || totalSelected === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isAssessing
                      ? 'bg-white/20 cursor-not-allowed'
                      : totalSelected === 0
                      ? 'bg-white/20 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {isAssessing ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assessing...
                    </span>
                  ) : assessment && assessment.score >= 7 ? (
                    '✨ Generate Code'
                  ) : (
                    '🔍 Assess Files'
                  )}
                </button>

                {totalSelected === 0 && (
                  <p className="text-xs opacity-75 mt-2">
                    Select at least one file to continue
                  </p>
                )}
              </div>
            </div>

            {/* Success Message */}
            {assessment && assessment.score >= 7 && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="font-semibold text-green-800 mb-2">
                    Excellent Selection!
                  </h3>
                  <p className="text-sm text-green-700">
                    Your files provide comprehensive context for high-quality
                    code generation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add File Dialog */}
      {showFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add Reference File</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Path
                </label>
                <input
                  type="text"
                  placeholder="/src/components/MyComponent.tsx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={customFilePath}
                  onChange={(e) => setCustomFilePath(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomFile()}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the absolute path to your file
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowFileDialog(false)
                    setCustomFilePath('')
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomFile}
                  disabled={!customFilePath.trim()}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    customFilePath.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Step2PromptClarification
