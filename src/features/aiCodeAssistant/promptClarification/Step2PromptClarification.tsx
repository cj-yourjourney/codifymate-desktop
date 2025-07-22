// components/Step2PromptClarification.tsx (updated)
import React from 'react'
import { useAppSelector } from '@/shared/store/hook'


const Step2PromptClarification: React.FC = () => {
  const { clarifyingQuestions, relevantFiles, loading, error } = useAppSelector(
    (state) => state.promptClarification
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-4">Analyzing your project...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  if (clarifyingQuestions.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No clarifying questions available. Please refine your prompt first.
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Clarifying Questions ({clarifyingQuestions.length})
        </h3>
        <div className="space-y-4">
          {clarifyingQuestions.map((question, index) => (
            <div key={index} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <p className="font-medium mb-3">{question}</p>
                <textarea
                  className="textarea textarea-bordered textarea-sm resize-none"
                  rows={2}
                  placeholder="Your answer..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">
          Relevant Files ({relevantFiles.length})
        </h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {relevantFiles.length > 0 ? (
            relevantFiles.map((filePath, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
              >
                <div className="flex items-center flex-1">
                  <span className="text-base-content/60 mr-3">📄</span>
                  <span className="text-sm truncate" title={filePath}>
                    {filePath}
                  </span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="checkbox checkbox-primary checkbox-sm"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-base-content/60">
              No relevant files found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2PromptClarification
