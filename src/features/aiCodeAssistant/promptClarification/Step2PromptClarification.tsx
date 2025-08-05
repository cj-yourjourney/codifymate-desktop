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
import LoadingModal from '@/shared/components/LoadingModal'

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

    try {
      dispatch(setFileLoading(true))

      if (isCurrentlySelected) {
        // File is selected, remove it - only pass filePath
        dispatch(toggleRelevantFile({ filePath, action: 'remove' }))
      } else {
        // File is not selected, read content and add it
        const content = await window.electronAPI.readFileContent(filePath)
        dispatch(toggleRelevantFile({ filePath, content, action: 'add' }))
      }

      dispatch(setFileLoading(false))
    } catch (error) {
      console.error(`Error toggling file ${filePath}:`, error)
      dispatch(setFileLoading(false))
    }
  }

  const handleRemoveManualFile = (filePath: string) => {
    dispatch(removeManualFile(filePath))
  }

  // Loading modal for analysis
 if (loading) {
   return (
     <LoadingModal
       isOpen={true}
       title="Analyzing Your Project"
       message="AI is analyzing your project structure and generating clarifying questions..."
     />
   )
 }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div className="flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
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
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  if (clarifyingQuestions.length === 0) {
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            No Questions Available
          </h3>
          <p className="text-base-content/60">
            Please complete the first step to generate clarifying questions.
          </p>
        </div>
      </div>
    )
  }

  const allFiles = [...selectedRelevantFiles, ...manuallyAddedFiles]
  const answeredCount = clarifyingQuestionsWithAnswers.length
  const completionPercentage = Math.round(
    (answeredCount / clarifyingQuestions.length) * 100
  )

  return (
    <div className="space-y-8">
      {/* File Loading Modal */}
      <LoadingModal
        isOpen={fileLoading}
        title="Reading Files"
        message="Loading file content for analysis..."
      />

      {/* Progress Overview */}
      <div className="card bg-gradient-to-r from-primary/5 to-primary/5 shadow-lg border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-base-content">
                Project Clarification
              </h2>
              <p className="text-base-content/60">
                Help AI understand your requirements better
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {completionPercentage}%
              </div>
              <div className="text-sm text-base-content/60">Complete</div>
            </div>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={completionPercentage}
            max="100"
          ></progress>
          <div className="flex justify-between text-xs text-base-content/60 mt-2">
            <span>
              {answeredCount} of {clarifyingQuestions.length} questions answered
            </span>
            <span>{allFiles.length} files selected</span>
          </div>
        </div>
      </div>

      {/* Clarifying Questions Section */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center mb-6">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Clarifying Questions
              </h3>
              <p className="text-sm text-base-content/60">
                Answer these to help AI generate better code
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {clarifyingQuestions.map((question, index) => {
              const isAnswered = questionAnswers[question]?.trim()
              return (
                <div
                  key={index}
                  className={`border rounded-lg transition-all ${
                    isAnswered
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-base-300 bg-base-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-1 ${
                            isAnswered
                              ? 'bg-primary text-primary-content'
                              : 'bg-base-300 text-base-content/60'
                          }`}
                        >
                          {isAnswered ? (
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <p className="text-base font-medium text-base-content leading-relaxed">
                          {question}
                        </p>
                      </div>
                    </div>
                    <div className="ml-9">
                      <textarea
                        className={`textarea textarea-bordered w-full text-sm resize-none transition-colors ${
                          isAnswered
                            ? 'textarea-primary'
                            : 'focus:textarea-primary'
                        }`}
                        rows={3}
                        placeholder="Your detailed answer..."
                        value={questionAnswers[question] || ''}
                        onChange={(e) =>
                          handleAnswerChange(question, e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Additional Notes Section */}
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-base-content">
                Additional Notes
              </h3>
              <p className="text-sm text-base-content/60">
                Any extra context or requirements
              </p>
            </div>
          </div>

          <textarea
            className="textarea textarea-bordered w-full h-24 text-base resize-none focus:textarea-primary transition-colors"
            placeholder="Add any additional context, specific requirements, constraints, or notes that would help generate better code..."
            value={additionalNotes}
            onChange={(e) => handleAdditionalNotesChange(e.target.value)}
          />
          <div className="flex justify-between text-xs text-base-content/50 mt-2">
            <span>{additionalNotes.length} characters</span>
            <span>
              💡 Include styling preferences, patterns, or constraints
            </span>
          </div>
        </div>
      </div>

      {/* File Selection Section */}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-base-content">
                  Context Files
                </h3>
                <p className="text-sm text-base-content/60">
                  Select relevant files for context
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="badge badge-primary badge-lg">
                {allFiles.length} selected
              </div>
              <button
                className="btn btn-outline btn-primary btn-sm"
                onClick={handleAddFiles}
                disabled={fileLoading}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Files
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Suggested Files */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-primary flex items-center">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  AI Suggested ({relevantFiles.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {relevantFiles.length > 0 ? (
                  relevantFiles.map((filePath, index) => {
                    const isSelected = selectedRelevantFiles.some(
                      (f) => f.filePath === filePath
                    )
                    return (
                      <div
                        key={`relevant-${index}`}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-base-300 bg-base-50 hover:border-primary/20'
                        }`}
                        onClick={() => handleRelevantFileToggle(filePath)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4 text-primary"
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
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="font-medium text-sm text-base-content truncate"
                                title={filePath}
                              >
                                {filePath.split('/').pop() || filePath}
                              </div>
                              <div className="text-xs text-base-content/50 truncate">
                                {filePath}
                              </div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleRelevantFileToggle(filePath)
                            }}
                            className="checkbox checkbox-primary checkbox-sm"
                            disabled={fileLoading}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-base-content/60">
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
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">No AI suggested files</p>
                  </div>
                )}
              </div>
            </div>

            {/* Manually Added Files */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-primary flex items-center">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Manually Added ({manuallyAddedFiles.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {manuallyAddedFiles.length > 0 ? (
                  manuallyAddedFiles.map((file, index) => (
                    <div
                      key={`manual-${index}`}
                      className="p-3 rounded-lg border border-primary/30 bg-primary/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                            <div
                              className="font-medium text-sm text-base-content truncate"
                              title={file.filePath}
                            >
                              {file.filePath.split('/').pop() || file.filePath}
                            </div>
                            <div className="text-xs text-base-content/50 truncate">
                              {file.filePath}
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          onClick={() => handleRemoveManualFile(file.filePath)}
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
                  ))
                ) : (
                  <div className="text-center py-8 text-base-content/60">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm mb-3">No manually added files</p>
                    <button
                      className="btn btn-outline btn-primary btn-sm"
                      onClick={handleAddFiles}
                      disabled={fileLoading}
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Files
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Summary */}
          {allFiles.length > 0 && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-primary">
                  <div className="font-semibold mb-1">Context Ready</div>
                  <div className="text-primary/80">
                    {allFiles.length} files selected (
                    {selectedRelevantFiles.length} AI suggested +{' '}
                    {manuallyAddedFiles.length} manually added)
                  </div>
                  <div className="text-primary/70 text-xs mt-1">
                    File content is loaded and ready for code generation
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2PromptClarification
