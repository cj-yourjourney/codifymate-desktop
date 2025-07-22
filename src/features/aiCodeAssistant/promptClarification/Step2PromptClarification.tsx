import React, { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import {
  updateQuestionAnswer,
  setAdditionalNotes,
  addManualFile,
  removeManualFile,
  setSelectedRelevantFiles
} from './state/promptClarificationSlice'

const Step2PromptClarification: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    clarifyingQuestionsWithAnswers,
    relevantFiles,
    selectedRelevantFiles,
    manuallyAddedFiles,
    additionalNotes,
    loading,
    error
  } = useAppSelector((state) => state.promptClarification)

  const [showFileSelector, setShowFileSelector] = useState(false)

  // Initialize selected files when component mounts or relevantFiles change
  useEffect(() => {
    if (relevantFiles.length > 0 && selectedRelevantFiles.length === 0) {
      dispatch(setSelectedRelevantFiles(relevantFiles))
    }
  }, [relevantFiles, selectedRelevantFiles.length, dispatch])

  const handleAnswerChange = (index: number, answer: string) => {
    dispatch(updateQuestionAnswer({ index, answer }))
  }

  const handleAdditionalNotesChange = (notes: string) => {
    dispatch(setAdditionalNotes(notes))
  }

  const handleAddFiles = async () => {
    try {
      if (window.electronAPI) {
        const selectedFiles = await window.electronAPI.selectFiles()
        if (selectedFiles && selectedFiles.length > 0) {
          selectedFiles.forEach((file) => {
            dispatch(addManualFile(file))
          })
        }
      }
    } catch (error) {
      console.error('Error selecting files:', error)
    }
  }

  const handleRelevantFileToggle = (filePath: string) => {
    const updatedSelection = selectedRelevantFiles.includes(filePath)
      ? selectedRelevantFiles.filter((f) => f !== filePath)
      : [...selectedRelevantFiles, filePath]

    dispatch(setSelectedRelevantFiles(updatedSelection))
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

  if (clarifyingQuestionsWithAnswers.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No clarifying questions available. Please refine your prompt first.
      </div>
    )
  }

  const allFiles = [...selectedRelevantFiles, ...manuallyAddedFiles]

  return (
    <div className="space-y-6">
      {/* Clarifying Questions Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Clarifying Questions ({clarifyingQuestionsWithAnswers.length})
        </h3>
        <div className="space-y-4">
          {clarifyingQuestionsWithAnswers.map((qa, index) => (
            <div key={index} className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <p className="font-medium mb-3">{qa.question}</p>
                <textarea
                  className="textarea textarea-bordered textarea-sm resize-none"
                  rows={2}
                  placeholder="Your answer..."
                  value={qa.answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
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
          <button className="btn btn-outline btn-sm" onClick={handleAddFiles}>
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
                relevantFiles.map((filePath, index) => (
                  <div
                    key={`relevant-${index}`}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center flex-1">
                      <span className="text-primary mr-3">🤖</span>
                      <span className="text-sm truncate" title={filePath}>
                        {filePath.split('/').pop() || filePath}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRelevantFiles.includes(filePath)}
                      onChange={() => handleRelevantFileToggle(filePath)}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                  </div>
                ))
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
                manuallyAddedFiles.map((filePath, index) => (
                  <div
                    key={`manual-${index}`}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div className="flex items-center flex-1">
                      <span className="text-secondary mr-3">👤</span>
                      <span className="text-sm truncate" title={filePath}>
                        {filePath.split('/').pop() || filePath}
                      </span>
                    </div>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleRemoveManualFile(filePath)}
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
              Total files selected:{' '}
              {selectedRelevantFiles.length + manuallyAddedFiles.length}(
              {selectedRelevantFiles.length} AI suggested +{' '}
              {manuallyAddedFiles.length} manually added)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step2PromptClarification
