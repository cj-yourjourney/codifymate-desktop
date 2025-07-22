import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import {
  updateQuestionAnswer,
  setAdditionalNotes,
  addManualFile,
  removeManualFile,
  toggleRelevantFile,
  setFileLoading
} from './state/promptClarificationSlice'

const Step2PromptClarification: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    clarifyingQuestions,
    clarifyingQuestionsWithAnswers,
    relevantFiles,
    selectedRelevantFiles,
    manuallyAddedFiles,
    additionalNotes,
    loading,
    error,
    fileLoading
  } = useAppSelector((state) => state.promptClarification)

  // Local state to track answers for all questions (including unanswered ones)
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, string>
  >({})

  const handleAnswerChange = (question: string, answer: string) => {
    // Update local state
    setQuestionAnswers((prev) => ({
      ...prev,
      [question]: answer
    }))

    // Update Redux state (this will add/remove from clarifyingQuestionsWithAnswers based on whether answer is empty)
    dispatch(updateQuestionAnswer({ question, answer }))
  }

  const handleAdditionalNotesChange = (notes: string) => {
    dispatch(setAdditionalNotes(notes))
  }

  const handleAddFiles = async () => {
    try {
      if (window.electronAPI) {
        dispatch(setFileLoading(true))
        const selectedFiles = await window.electronAPI.selectFiles()

        if (selectedFiles && selectedFiles.length > 0) {
          // Read content for each selected file
          for (const filePath of selectedFiles) {
            try {
              const content = await window.electronAPI.readFileContent(filePath)
              dispatch(addManualFile({ filePath, content }))
            } catch (error) {
              console.error(`Error reading file ${filePath}:`, error)
              // You might want to show a toast notification here
            }
          }
        }
        dispatch(setFileLoading(false))
      }
    } catch (error) {
      console.error('Error selecting files:', error)
      dispatch(setFileLoading(false))
    }
  }

  const handleRelevantFileToggle = async (filePath: string) => {
    const isCurrentlySelected = selectedRelevantFiles.some(
      (f) => f.filePath === filePath
    )

    if (isCurrentlySelected) {
      // File is selected, remove it
      dispatch(toggleRelevantFile({ filePath }))
    } else {
      // File is not selected, read content and add it
      try {
        dispatch(setFileLoading(true))
        const content = await window.electronAPI.readFileContent(filePath)
        dispatch(toggleRelevantFile({ filePath, content }))
        dispatch(setFileLoading(false))
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error)
        dispatch(setFileLoading(false))
        // You might want to show a toast notification here
      }
    }
  }

  const handleRemoveManualFile = (filePath: string) => {
    dispatch(removeManualFile(filePath))
  }

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

  const allFiles = [...selectedRelevantFiles, ...manuallyAddedFiles]

  return (
    <div className="space-y-6">
      {/* File Loading Indicator */}
      {fileLoading && (
        <div className="alert alert-info">
          <span className="loading loading-spinner loading-sm"></span>
          <span>Reading file content...</span>
        </div>
      )}

      {/* Clarifying Questions Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Clarifying Questions ({clarifyingQuestions.length})
          {clarifyingQuestionsWithAnswers.length > 0 && (
            <span className="text-sm text-success ml-2">
              ({clarifyingQuestionsWithAnswers.length} answered)
            </span>
          )}
        </h3>
        <div className="space-y-4">
          {clarifyingQuestions.map((question, index) => (
            <div key={index} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-start justify-between mb-3">
                  <p className="font-medium flex-1">{question}</p>
                  {questionAnswers[question]?.trim() && (
                    <span className="badge badge-success badge-sm">✓</span>
                  )}
                </div>
                <textarea
                  className="textarea textarea-bordered textarea-sm resize-none"
                  rows={2}
                  placeholder="Your answer..."
                  value={questionAnswers[question] || ''}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-4">
            <textarea
              className="textarea textarea-bordered resize-none"
              rows={4}
              placeholder="Add any additional context, requirements, or notes that would help generate better code..."
              value={additionalNotes}
              onChange={(e) => handleAdditionalNotesChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* File Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Selected Files ({allFiles.length})
          </h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleAddFiles}
            disabled={fileLoading}
          >
            📁 Add Files
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Relevant Files (from AI analysis) */}
          <div>
            <h4 className="font-medium mb-3 text-primary">
              AI Suggested Files ({relevantFiles.length})
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {relevantFiles.length > 0 ? (
                relevantFiles.map((filePath, index) => {
                  const isSelected = selectedRelevantFiles.some(
                    (f) => f.filePath === filePath
                  )
                  return (
                    <div
                      key={`relevant-${index}`}
                      className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                    >
                      <div className="flex items-center flex-1">
                        <span className="text-primary mr-3">🤖</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" title={filePath}>
                            {filePath.split('/').pop() || filePath}
                          </div>
                          <div className="text-xs text-base-content/60 truncate">
                            {filePath}
                          </div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRelevantFileToggle(filePath)}
                        className="checkbox checkbox-primary checkbox-sm"
                        disabled={fileLoading}
                      />
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4 text-base-content/60">
                  No AI suggested files
                </div>
              )}
            </div>
          </div>

          {/* Manually Added Files */}
          <div>
            <h4 className="font-medium mb-3 text-secondary">
              Manually Added Files ({manuallyAddedFiles.length})
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {manuallyAddedFiles.length > 0 ? (
                manuallyAddedFiles.map((file, index) => (
                  <div
                    key={`manual-${index}`}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center flex-1">
                      <span className="text-secondary mr-3">👤</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" title={file.filePath}>
                          {file.filePath.split('/').pop() || file.filePath}
                        </div>
                        <div className="text-xs text-base-content/60 truncate">
                          {file.filePath}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleRemoveManualFile(file.filePath)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-base-content/60">
                  No manually added files
                  <br />
                  <button
                    className="btn btn-outline btn-xs mt-2"
                    onClick={handleAddFiles}
                    disabled={fileLoading}
                  >
                    Add Files
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Summary */}
        <div className="mt-4 p-3 bg-info/10 rounded-lg">
          <div className="flex items-center text-info">
            <span className="mr-2">ℹ️</span>
            <span className="text-sm">
              Total files selected: {allFiles.length} (
              {selectedRelevantFiles.length} AI suggested +{' '}
              {manuallyAddedFiles.length} manually added)
            </span>
          </div>
          {allFiles.length > 0 && (
            <div className="mt-2 text-xs text-base-content/60">
              File content is loaded and ready for processing
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2PromptClarification
