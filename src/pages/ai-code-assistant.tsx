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
import {
  Edit3,
  HelpCircle,
  Code,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Loader2
} from 'lucide-react'

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
    'Add Details & Files',
    'Generate & Refine'
  ]

  const stepIcons = [
    <Edit3 className="w-5 h-5 text-current" />,
    <HelpCircle className="w-5 h-5 text-current" />,
    <Code className="w-5 h-5 text-current" />
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
            <AlertCircle className="stroke-current flex-shrink-0 h-6 w-6 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => clearStepError(step)}
          >
            <X className="w-4 h-4" />
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-base-200 to-base-300">
      {/* Loading Modal */}
      {loadingConfig && (
        <LoadingModal
          isOpen={clarificationLoading || codeGenerationLoading}
          title={loadingConfig.title}
          message={loadingConfig.message}
        />
      )}

      {/* Header - Fixed height */}
      <div className="flex-shrink-0 bg-base-100/90 backdrop-blur-sm border-b border-base-200 px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              AI Code Assistant
            </h1>
            <p className="text-sm text-base-content/70">
              Transform your ideas into production-ready code
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps - Fixed height */}
      <div className="flex-shrink-0 bg-base-100/50 backdrop-blur-sm border-b border-base-200 px-6 py-4">
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
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${
                      isCompleted
                        ? 'border-stone-300 bg-stone-100 text-stone-600 shadow-sm'
                        : isActive
                        ? 'border-primary bg-primary text-primary-content shadow-lg scale-110'
                        : 'border-stone-200 bg-stone-50 text-stone-400'
                    }`}
                    onClick={() => isClickable && handleStepClick(stepNumber)}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
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
                          ? 'text-stone-700'
                          : 'text-stone-500'
                      }`}
                    >
                      Step {stepNumber}
                    </div>
                    <div
                      className={`text-xs ${
                        isActive
                          ? 'text-primary/80'
                          : isCompleted
                          ? 'text-stone-600'
                          : 'text-stone-400'
                      }`}
                    >
                      {title}
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < stepTitles.length - 1 && (
                    <div
                      className={`absolute left-10 top-5 w-8 h-0.5 transition-colors ${
                        currentStep > stepNumber
                          ? 'bg-stone-300'
                          : 'bg-stone-200'
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

      {/* Main Content - Flexible height */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Step Header */}
        <div className="flex-shrink-0 bg-base-100 border-b border-base-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-3">
                {stepIcons[currentStep - 1]}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="text-xl font-bold text-base-content">
                    {stepTitles[currentStep - 1]}
                  </h2>
                  <div className="badge badge-primary">
                    Step {currentStep} of {stepTitles.length}
                  </div>
                </div>
                <p className="text-sm text-base-content/60">
                  {currentStep === 1 &&
                    'Write your prompt and select the project folder to work on'}
                  {currentStep === 2 &&
                    'Share more details and select reference files for better code generation'}
                  {currentStep === 3 &&
                    'Review, copy, and refine your generated code'}
                </p>
              </div>
            </div>

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
          </div>
        </div>

        {/* Step-specific errors */}
        {stepErrors[currentStep] && (
          <div className="flex-shrink-0 px-6 pt-4">
            {renderStepError(currentStep)}
          </div>
        )}

        {/* Step Content - Takes remaining space */}
        <div className="flex-1 overflow-auto bg-base-100">
          {renderStepContent()}
        </div>

        {/* Navigation Footer - Fixed height */}
        <div className="flex-shrink-0 bg-base-100 border-t border-base-200 px-6 py-4">
          <div className="flex justify-between items-center">
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
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {codeGenerationLoading
                      ? 'Generating Code...'
                      : 'Processing...'}
                  </>
                ) : (
                  <>
                    {getStepButtonText()}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center text-primary">
                <CheckCircle className="w-5 h-5 mr-2" />
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
        <div className="absolute bottom-20 left-6 right-6 z-10">
          <div className="alert alert-warning shadow-lg">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                <AlertTriangle className="stroke-current flex-shrink-0 h-6 w-6 mr-2" />
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
    </div>
  )
}

export default AICodeAssistant
