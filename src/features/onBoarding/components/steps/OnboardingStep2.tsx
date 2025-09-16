
import React from 'react'
import { FolderOpen, Plus, Check } from 'lucide-react'
import { mockFiles } from '../../constants/mockData'

interface OnboardingStep2Props {
  projectPath: string
  setProjectPath: (path: string) => void
  selectedFiles: string[]
  setSelectedFiles: (files: string[]) => void
  onContinue: () => void
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  projectPath,
  setProjectPath,
  selectedFiles,
  setSelectedFiles,
  onContinue
}) => {
  const handleDemoFolder = () => {
    setProjectPath('/Users/john/projects/my-nextjs-app')
    setSelectedFiles(mockFiles.slice(0, 3))
  }

  const handleToggleFile = (path: string) => {
    if (selectedFiles.includes(path)) {
      setSelectedFiles(selectedFiles.filter((f) => f !== path))
    } else {
      setSelectedFiles([...selectedFiles, path])
    }
  }

  if (!projectPath) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white rounded-lg border p-8 text-center">
          <FolderOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900 mb-2">Select Project</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose your project folder
          </p>
          <button
            onClick={handleDemoFolder}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Select Folder
          </button>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Demo:</strong> Click to simulate selecting a Next.js
              project folder
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-medium">my-nextjs-app</h3>
            <p className="text-sm text-gray-500">127 files</p>
          </div>
          <button
            onClick={() => setProjectPath('')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Change
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedFiles(mockFiles)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Analyze
          </button>
          <button className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <>
            <div className="space-y-1 mb-4">
              {mockFiles.map((path, index) => {
                const selected = selectedFiles.includes(path)
                const aiSuggested = index < 3

                return (
                  <div
                    key={path}
                    onClick={() => handleToggleFile(path)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      selected ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span>{aiSuggested ? '⭐' : '📄'}</span>
                      <span className="text-sm truncate">
                        {path.split('/').pop()}
                      </span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selected && <Check className="w-2 h-2 text-white" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={onContinue}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Continue ({selectedFiles.length})
            </button>

            {/* Demo explanation */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>⭐ AI Suggested:</strong> These files are recommended
                based on your prompt. Toggle files to include in code
                generation.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
