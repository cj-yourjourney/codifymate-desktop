import React, { useState, useEffect } from 'react'
import { BarChart3, FileText } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  assessPrompt,
  clearAssessment,
  clearError
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
    lastPrompt
  } = useAppSelector((state) => state.promptAssessment)

  // Use external props if provided, otherwise use local state and Redux
  const [localUserPrompt, setLocalUserPrompt] = useState('')

  // Determine which prompt value and setter to use
  const isControlledByParent =
    externalUserPrompt !== undefined && externalSetUserPrompt !== undefined
  const userPrompt = isControlledByParent ? externalUserPrompt : localUserPrompt
  const setUserPrompt = isControlledByParent
    ? externalSetUserPrompt
    : setLocalUserPrompt
  const assessment =
    externalAssessment !== undefined ? externalAssessment : reduxAssessment
  const isAssessing =
    externalIsAssessing !== undefined ? externalIsAssessing : reduxIsAssessing

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
    if (lastPrompt && lastPrompt !== userPrompt.trim()) {
      dispatch(clearAssessment())
    }

    // Dispatch the assessment action
    dispatch(assessPrompt({ user_prompt: userPrompt.trim() }))
  }

  const shouldShowSelectFiles = assessment && assessment.score >= 7

  const handleButtonClick = () => {
    if (shouldShowSelectFiles && onNavigateToStep2) {
      onNavigateToStep2()
    } else {
      if (externalOnAssessPrompt) {
        externalOnAssessPrompt()
      } else {
        handleAssessPrompt()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="rounded-xl p-6 mb-8 border-l-4 bg-red-50 border-red-400">
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 bg-red-500">
                  !
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Assessment Failed
                  </h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(clearError())}
                className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Assessment Result Banner */}
        {assessment && !error && (
          <div
            className={`rounded-xl p-6 mb-8 border-l-4 ${
              assessment.score >= 7
                ? 'bg-green-50 border-green-400'
                : 'bg-amber-50 border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                    assessment.score >= 7 ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                >
                  {assessment.score}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Assessment Complete
                  </h3>
                  <p
                    className={`text-sm ${
                      assessment.score >= 7
                        ? 'text-green-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {assessment.content.title}
                  </p>
                  {assessment.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      Category: {assessment.category}
                    </p>
                  )}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  assessment.score >= 8
                    ? 'bg-green-100 text-green-800'
                    : assessment.score >= 6
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {assessment.score >= 8
                  ? 'Excellent'
                  : assessment.score >= 6
                  ? 'Good'
                  : 'Needs Work'}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Prompt Input - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <textarea
                  className="w-full h-64 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Describe the code you want to generate. Be specific about functionality, technology stack, UI/UX requirements, and any constraints..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                />
              </div>
            </div>

            {/* Assessment Details - Only show when assessment exists */}
            {assessment && !error && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detailed Assessment
                  </h3>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Prompt Quality Score</span>
                    <span>{assessment.score}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        assessment.score >= 8
                          ? 'bg-green-500'
                          : assessment.score >= 6
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${assessment.score * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Assessment items */}
                <div className="space-y-4">
                  {assessment.content.items.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 ${
                          assessment.type === 'excellent'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {assessment.type === 'excellent' ? '✓' : index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>

                {/* Credit usage display */}
                {assessment.creditUsage && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Credit Usage:</span>
                      <span className="font-medium text-gray-900">
                        {assessment.creditUsage.toFixed(2)} credits
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assessment Action Card */}
            <div
              className={`rounded-xl p-6 text-white transition-all duration-300 ${
                shouldShowSelectFiles
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {shouldShowSelectFiles ? '🎯' : '🔍'}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {shouldShowSelectFiles
                    ? 'Ready for Next Step!'
                    : 'Get AI Feedback'}
                </h3>
                <p className="text-sm opacity-90 mb-6">
                  {shouldShowSelectFiles
                    ? 'Your prompt looks great! Now select reference files for better context.'
                    : 'Get detailed feedback on your prompt to ensure optimal results from AI code generation.'}
                </p>

                <button
                  onClick={handleButtonClick}
                  disabled={!userPrompt.trim() || isAssessing}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isAssessing
                      ? 'bg-white/20 cursor-not-allowed'
                      : !userPrompt.trim()
                      ? 'bg-white/20 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {isAssessing ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assessing...
                    </span>
                  ) : shouldShowSelectFiles ? (
                    <span className="flex items-center justify-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Select Reference Files
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Assess Your Prompt
                    </span>
                  )}
                </button>

                {!userPrompt.trim() && (
                  <p className="text-xs opacity-75 mt-2">
                    Write a prompt to continue
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {assessment && !error && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Assessment Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {assessment.score}/10
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`text-sm font-medium ${
                        assessment.score >= 7
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {assessment.score >= 7
                        ? 'Ready to proceed'
                        : 'Needs improvement'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {assessment.type === 'excellent'
                        ? 'Strengths'
                        : 'Questions'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {assessment.content.items.length}
                    </span>
                  </div>

                  {assessment.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <span className="text-sm font-medium text-gray-900">
                        {assessment.category}
                      </span>
                    </div>
                  )}

                  {assessment.creditUsage && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Credits Used
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {assessment.creditUsage.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1PromptRefinement
