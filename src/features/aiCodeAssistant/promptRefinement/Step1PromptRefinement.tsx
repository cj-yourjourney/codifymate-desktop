import React, { useState, useEffect } from 'react'
import { BarChart3, FileText } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  assessPrompt,
  clearAssessment,
  clearError,
  setUserPrompt
} from './state/promptAssessmentSlice'
import type { AssessmentState } from './state/promptAssessmentSlice'

interface Step1PromptRefinementProps {
  userPrompt?: string
  setUserPrompt?: (prompt: string) => void
  assessment?: AssessmentState | null
  isAssessing?: boolean
  onAssessPrompt?: () => void
  onNavigateToStep2?: () => void
}

const Step1PromptRefinement: React.FC<Step1PromptRefinementProps> = ({
  userPrompt: externalUserPrompt,
  setUserPrompt: externalSetUserPrompt,
  assessment: externalAssessment,
  isAssessing: externalIsAssessing,
  onAssessPrompt: externalOnAssessPrompt,
  onNavigateToStep2
}) => {
  // Redux state and actions
  const dispatch = useAppDispatch()
  const {
    assessment: reduxAssessment,
    isLoading: reduxIsAssessing,
    error,
    user_prompt: reduxUserPrompt
  } = useAppSelector((state) => state.promptAssessment)

  // Use external props if provided, otherwise use local state and Redux
  const [localUserPrompt, setLocalUserPrompt] = useState('')

  // Determine which prompt value and setter to use
  const isControlledByParent =
    externalUserPrompt !== undefined && externalSetUserPrompt !== undefined

  const userPrompt = isControlledByParent ? externalUserPrompt : localUserPrompt

  const setUserPromptValue = (prompt: string) => {
    if (isControlledByParent && externalSetUserPrompt) {
      externalSetUserPrompt(prompt)
    } else {
      setLocalUserPrompt(prompt)
    }
    // Always update Redux state for consistency
    dispatch(setUserPrompt(prompt))
  }

  const assessment =
    externalAssessment !== undefined ? externalAssessment : reduxAssessment
  const isAssessing =
    externalIsAssessing !== undefined ? externalIsAssessing : reduxIsAssessing

  // Initialize local state from Redux if not controlled by parent
  useEffect(() => {
    if (!isControlledByParent && reduxUserPrompt && !localUserPrompt) {
      setLocalUserPrompt(reduxUserPrompt)
    }
  }, [reduxUserPrompt, isControlledByParent, localUserPrompt])

  // Clear error when component mounts or when prompt changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  // Handle prompt assessment
  const handleAssessPrompt = async () => {
    if (externalOnAssessPrompt) {
      externalOnAssessPrompt()
      return
    }

    if (!userPrompt.trim()) {
      return
    }

    // Clear previous assessment if prompt has changed
    if (reduxUserPrompt && reduxUserPrompt !== userPrompt.trim()) {
      dispatch(clearAssessment())
    }

    // Dispatch the assessment action
    dispatch(assessPrompt({ user_prompt: userPrompt.trim() }))
  }

  // Modified: Allow proceeding to Step2 after any assessment (regardless of score)
  const shouldShowSelectFiles = assessment !== null && !error

  // Always allow assessment, but only show continue option after first assessment
  const handleAssessButtonClick = () => {
    if (externalOnAssessPrompt) {
      externalOnAssessPrompt()
    } else {
      handleAssessPrompt()
    }
  }

  const handleContinueButtonClick = () => {
    if (onNavigateToStep2) {
      onNavigateToStep2()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Assessment Result */}
        {assessment && !error && (
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {assessment.score}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {assessment.content.title}
                  </h3>
                  <p className="text-sm text-gray-500">{assessment.category}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  assessment.score >= 7
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {assessment.score}/10
              </span>
            </div>

            {/* Feedback Items */}
            <div className="space-y-2">
              {assessment.content.items.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Prompt Input */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Describe what you want to build
              </label>
              <textarea
                className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Be specific about functionality, tech stack, UI requirements..."
                value={userPrompt}
                onChange={(e) => setUserPromptValue(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-medium text-gray-900 mb-4">Actions</h3>

              {/* Assess Button */}
              <button
                onClick={handleAssessButtonClick}
                disabled={!userPrompt.trim() || isAssessing}
                className={`w-full mb-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isAssessing || !userPrompt.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAssessing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Assessing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {assessment ? 'Assess Again' : 'Assess Prompt'}
                  </span>
                )}
              </button>

              {/* Continue Button */}
              {shouldShowSelectFiles && (
                <button
                  onClick={handleContinueButtonClick}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <span className="flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Continue
                  </span>
                </button>
              )}

              {/* Score Display */}
              {assessment && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Score:</span>
                    <span className="font-medium">{assessment.score}/10</span>
                  </div>
                  {assessment.creditUsage && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Credits:</span>
                      <span className="font-medium">
                        {assessment.creditUsage.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1PromptRefinement
