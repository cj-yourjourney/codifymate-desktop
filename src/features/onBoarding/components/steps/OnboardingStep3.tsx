// components/steps/OnboardingStep3.tsx
import React from 'react'
import {
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { mockGeneratedCode } from '../../constants/mockData'

interface OnboardingStep3Props {
  expandedFiles: Set<string>
  setExpandedFiles: (files: Set<string>) => void
  refinePrompt: string
  setRefinePrompt: (prompt: string) => void
}

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  expandedFiles,
  setExpandedFiles,
  refinePrompt,
  setRefinePrompt
}) => {
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

  const refinementSuggestions = [
    'Add a forgot password link',
    'Use Tailwind CSS styling',
    'Add loading animation'
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Generated Code</h3>
                <p className="text-sm text-gray-500">
                  2 files • 5.2 credits used
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <p className="text-sm text-gray-700">
                {mockGeneratedCode.explanation}
              </p>
            </div>

            <div className="space-y-2">
              {mockGeneratedCode.files_to_modify.map((file, index) => (
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
                        {file.file_path.split('/').pop()}
                      </span>
                      <span className="px-1 py-0.5 text-xs rounded bg-green-100 text-green-700">
                        {file.change_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Copy className="w-3 h-3" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
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
              ))}
            </div>
          </div>
        </div>

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
                />
                <div className="text-xs text-gray-500 mt-1">
                  {refinePrompt.length}/500 characters
                </div>
              </div>

              <button
                disabled={!refinePrompt.trim()}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Refine Code
              </button>

              {/* Demo suggestions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Try these:</p>
                {refinementSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setRefinePrompt(suggestion)}
                    className="w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Files:</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span>Credits left:</span>
                <span>24.8</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens:</span>
                <span>2,847</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
