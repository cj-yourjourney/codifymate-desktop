import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import { refinePrompt } from '@/features/aiCodeAssistant/promptClarification/state/promptClarificationSlice'
import {
  generateCode,
  clearError
} from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'
import {
  Step1PromptRefinement,
  Step2PromptClarification,
  Step3CodeGeneration
} from '@/features/aiCodeAssistant/steps'
import LoadingModal from '@/shared/components/LoadingModal'

const AICodeAssistant: React.FC = () => {
  const dispatch = useAppDispatch()

  const promptRefinementState = useAppSelector(
    (state) => state.promptRefinement
  )
  const promptClarificationState = useAppSelector(
    (state) => state.promptClarification
  )
  const codeGenerationState = useAppSelector((state) => state.codeGeneration)

  const { userPrompt, projectFilePaths } = promptRefinementState
  const {
    clarifyingQuestionsWithAnswers,
    additionalNotes,
    manuallyAddedFiles,
    selectedRelevantFiles,
    projectStructure,
    loading: clarificationLoading
  } = promptClarificationState

  const {
    currentVersion,
    loading: codeGenerationLoading,
    refining,
    error: codeGenerationError
  } = codeGenerationState

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [refinePromptText, setRefinePromptText] = useState<string>('')
  const [stepErrors, setStepErrors] = useState<{ [key: number]: string }>({})

  const stepTitles = [
    'Write Prompt',
    'Clarify & Configure',
    'Generate & Refine'
  ]
  

  const stepIcons = [
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-current"
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
    </svg>,
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-current"
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
    </svg>,
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-current"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  ]

  // Clear step error when moving to different step
  React.useEffect(() => {
    if (stepErrors[currentStep]) {
      const timer = setTimeout(() => {
        setStepErrors((prev) => ({ ...prev, [currentStep]: '' }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [stepErrors, currentStep])

  // Clear code generation error when component mounts
  React.useEffect(() => {
    if (codeGenerationError) {
      dispatch(clearError())
    }
  }, [])

  const setStepError = (step: number, error: string) => {
    setStepErrors((prev) => ({ ...prev, [step]: error }))
  }

  const clearStepError = (step: number) => {
    setStepErrors((prev) => ({ ...prev, [step]: '' }))
  }

  const handleNextStep = async () => {
    // Clear any existing errors for current step
    clearStepError(currentStep)

    if (currentStep === 1) {
      if (userPrompt && projectFilePaths.length > 0) {
        try {
          await dispatch(
            refinePrompt({
              user_prompts: userPrompt,
              project_file_paths: projectFilePaths
            })
          ).unwrap()
          setCurrentStep(2)
        } catch (error) {
          setStepError(
            1,
            error instanceof Error
              ? error.message
              : 'Failed to analyze project and generate questions'
          )
        }
      } else {
        const missingItems = []
        if (!userPrompt) missingItems.push('prompt')
        if (projectFilePaths.length === 0) missingItems.push('project folder')

        setStepError(1, `Please enter a ${missingItems.join(' and ')} first.`)
      }
    } else if (currentStep === 2) {
      // Prepare default values to ensure generateCode always triggers
      const defaultProjectStructure = projectStructure || {
        type: 'unknown',
        root: '.',
        structure: {
          root_files: []
        },
        conventions: {},
        framework: {}
      }

      const defaultClarifyingQuestions =
        clarifyingQuestionsWithAnswers.length > 0
          ? clarifyingQuestionsWithAnswers
          : [
              {
                question: 'No questions available',
                answer: 'No answer provided'
              }
            ]

      try {
        await dispatch(
          generateCode({
            userPrompt: userPrompt || 'Generate basic code structure',
            clarifyingQuestionsWithAnswers: defaultClarifyingQuestions,
            selectedRelevantFiles,
            manuallyAddedFiles,
            additionalNotes: additionalNotes || 'No additional notes provided',
            projectStructure: defaultProjectStructure
          })
        ).unwrap()

        setCurrentStep(3)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to generate code. Please check your connection and try again.'

        setStepError(2, errorMessage)
      }
    } else if (currentStep === 3) {
      // For step 3, we don't need to handle refinement here anymore
      // Refinement is now handled directly in the Step3CodeGeneration component
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      clearStepError(currentStep)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (step: number) => {
    if (
      step <= currentStep ||
      (step === currentStep + 1 && canProceedToStep(step))
    ) {
      clearStepError(currentStep)
      setCurrentStep(step)
    }
  }

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true
      case 2:
        return userPrompt.trim() !== '' && projectFilePaths.length > 0
      case 3:
        return (
          clarifyingQuestionsWithAnswers.length > 0 &&
          clarifyingQuestionsWithAnswers.every((qa) => qa.answer.trim() !== '')
        )
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PromptRefinement />
      case 2:
        return <Step2PromptClarification />
      case 3:
        return (
          <Step3CodeGeneration
            refinePrompt={refinePromptText}
            setRefinePrompt={setRefinePromptText}
          />
        )
      default:
        return null
    }
  }

  const getStepButtonText = () => {
    switch (currentStep) {
      case 1:
        return 'Refine Prompt & Context Files'
      case 2:
        return 'Generate Code'
      case 3:
        return 'Code Generated Successfully'
      default:
        return 'Continue'
    }
  }

  const isNextButtonDisabled = () => {
    const loading = clarificationLoading || codeGenerationLoading || refining

    if (loading) return true

    switch (currentStep) {
      case 1:
        return !userPrompt.trim() || projectFilePaths.length === 0
      case 2:
        // Always allow proceeding from step 2 to force generateCode to trigger
        return false
      case 3:
        // At step 3, we don't need the main next button to do anything
        return true
      default:
        return false
    }
  }

  const shouldShowNextButton = () => {
    // Hide the main next button on step 3 since refinement is handled within the component
    return currentStep < 3
  }

  const renderStepError = (step: number) => {
    const error = stepErrors[step]
    if (!error) return null

    return (
      <div className="alert alert-error shadow-lg mb-6">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6 mr-2"
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
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => clearStepError(step)}
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
    )
  }

  const getLoadingConfig = () => {
    if (currentStep === 1 && clarificationLoading) {
      return {
        title: 'Analyzing Your Project',
        message:
          'AI is analyzing your project structure and generating clarifying questions...'
      }
    } else if (currentStep === 2 && codeGenerationLoading) {
      return {
        title: 'Generating Code',
        message: 'AI is creating optimized code based on your requirements...'
      }
    }
    return null
  }

  const loadingConfig = getLoadingConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      {/* Loading Modal */}
      {loadingConfig && (
        <LoadingModal
          isOpen={clarificationLoading || codeGenerationLoading}
          title={loadingConfig.title}
          message={loadingConfig.message}
        />
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-primary"
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
            <div>
              <h1 className="text-5xl font-bold text-base-content mb-2">
                AI Code Assistant
              </h1>
              <p className="text-lg text-base-content/70">
                Transform your ideas into production-ready code
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1
                const isActive = currentStep === stepNumber
                const isCompleted = currentStep > stepNumber
                const isClickable =
                  canProceedToStep(stepNumber) || currentStep >= stepNumber

                return (
                  <div
                    key={stepNumber}
                    className={`flex items-center ${
                      index < stepTitles.length - 1 ? 'relative' : ''
                    }`}
                  >
                    {/* Step Circle */}
                    <div
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                      } ${
                        isCompleted
                          ? 'border-primary bg-primary text-primary-content shadow-lg'
                          : isActive
                          ? 'border-primary bg-primary text-primary-content shadow-lg scale-110'
                          : 'border-base-300 bg-base-100 text-base-content/50'
                      }`}
                      onClick={() => isClickable && handleStepClick(stepNumber)}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-5 h-5"
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
                        stepIcons[index]
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="ml-3">
                      <div
                        className={`text-sm font-semibold ${
                          isActive
                            ? 'text-primary'
                            : isCompleted
                            ? 'text-primary'
                            : 'text-base-content/60'
                        }`}
                      >
                        Step {stepNumber}
                      </div>
                      <div
                        className={`text-xs ${
                          isActive
                            ? 'text-primary/80'
                            : isCompleted
                            ? 'text-primary/80'
                            : 'text-base-content/50'
                        }`}
                      >
                        {title}
                      </div>
                    </div>

                    {/* Connection Line */}
                    {index < stepTitles.length - 1 && (
                      <div
                        className={`absolute left-12 top-6 w-8 h-0.5 transition-colors ${
                          currentStep > stepNumber
                            ? 'bg-primary'
                            : 'bg-base-300'
                        }`}
                        style={{ transform: 'translateX(1rem)' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card bg-base-100 shadow-2xl border border-base-200">
          <div className="card-body p-8">
            {/* Step Header */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                {stepIcons[currentStep - 1]}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-2xl font-bold text-base-content">
                    {stepTitles[currentStep - 1]}
                  </h2>
                  <div className="badge badge-lg badge-primary">
                    Step {currentStep} of {stepTitles.length}
                  </div>
                </div>
                <p className="text-base-content/60">
                  {currentStep === 1 &&
                    'Write your prompt and select the project folder to work on'}
                  {currentStep === 2 &&
                    'Answer questions and select relevant files for context'}
                  {currentStep === 3 &&
                    'Review, copy, and refine your generated code'}
                </p>
              </div>
            </div>

            {/* Step-specific errors */}
            {renderStepError(currentStep)}

            {/* Step Content */}
            <div className="mb-8">{renderStepContent()}</div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-base-200">
              <button
                className="btn btn-outline"
                onClick={handlePrevStep}
                disabled={
                  currentStep === 1 ||
                  clarificationLoading ||
                  codeGenerationLoading ||
                  refining
                }
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              {/* Step Indicators */}
              <div className="flex space-x-2">
                {stepTitles.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentStep === index + 1
                        ? 'bg-primary scale-125'
                        : currentStep > index + 1
                        ? 'bg-primary'
                        : 'bg-base-300'
                    }`}
                    onClick={() => handleStepClick(index + 1)}
                    disabled={
                      !canProceedToStep(index + 1) && currentStep <= index + 1
                    }
                  />
                ))}
              </div>

              {shouldShowNextButton() ? (
                <button
                  className={`btn btn-primary ${
                    stepErrors[currentStep] ? 'btn-disabled' : ''
                  }`}
                  onClick={handleNextStep}
                  disabled={isNextButtonDisabled() || !!stepErrors[currentStep]}
                >
                  {clarificationLoading || codeGenerationLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      {codeGenerationLoading
                        ? 'Generating Code...'
                        : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {getStepButtonText()}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 mr-2"
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
                  <span className="text-sm font-medium">
                    Code generation complete!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global error display for code generation errors */}
        {codeGenerationError && currentStep === 3 && (
          <div className="mt-6">
            <div className="alert alert-warning shadow-lg">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold">Code Generation Issue</h3>
                    <div className="text-sm opacity-80">
                      {codeGenerationError}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => dispatch(clearError())}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-base-content/50 text-sm">
          Powered by AI • Built with ❤️ for developers
        </div>
      </div>
    </div>
  )
}

export default AICodeAssistant
