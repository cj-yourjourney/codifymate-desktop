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

const AICodeAssistant: React.FC = () => {
  const dispatch = useAppDispatch()

  // Add debugging for Redux state
  const promptRefinementState = useAppSelector(
    (state) => state.promptRefinement
  )
  const promptClarificationState = useAppSelector(
    (state) => state.promptClarification
  )
  const codeGenerationState = useAppSelector((state) => state.codeGeneration)

  console.log('🔍 Redux states:', {
    promptRefinement: promptRefinementState,
    promptClarification: promptClarificationState,
    codeGeneration: codeGenerationState
  })

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
    'Refine Prompt',
    'Clarify & Select Files',
    'Generate & Refine Code'
  ]
  const stepColors = ['primary', 'success', 'secondary']

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
    console.log('🔴 BUTTON CLICKED! Current step:', currentStep)
    console.log('🔍 Component state:', {
      currentStep,
      userPrompt,
      projectFilePaths,
      clarificationLoading,
      codeGenerationLoading
    })
    console.log(`🔘 handleNextStep called at step ${currentStep}`)

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
          console.error('❌ Failed to refine prompt:', error)
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

      console.log('🔘 Step 2: Attempting to generate code...')
      console.log('📊 Current state:', {
        userPrompt: userPrompt || 'No prompt',
        clarifyingQuestionsCount: clarifyingQuestionsWithAnswers.length,
        projectStructureExists: !!projectStructure,
        selectedFilesCount: selectedRelevantFiles.length,
        manualFilesCount: manuallyAddedFiles.length
      })

      try {
        console.log('🚀 Dispatching generateCode with payload:', {
          userPrompt: userPrompt || 'Generate basic code structure',
          clarifyingQuestionsWithAnswers: defaultClarifyingQuestions,
          selectedRelevantFiles,
          manuallyAddedFiles,
          additionalNotes: additionalNotes || 'No additional notes provided',
          projectStructure: defaultProjectStructure
        })

        // Always trigger generateCode with default values if needed
        const result = await dispatch(
          generateCode({
            userPrompt: userPrompt || 'Generate basic code structure',
            clarifyingQuestionsWithAnswers: defaultClarifyingQuestions,
            selectedRelevantFiles,
            manuallyAddedFiles,
            additionalNotes: additionalNotes || 'No additional notes provided',
            projectStructure: defaultProjectStructure
          })
        ).unwrap()

        console.log('✅ generateCode completed successfully:', result)
        setCurrentStep(3)
      } catch (error) {
        console.error('❌ Failed to generate code:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to generate code. Please check your connection and try again.'

        setStepError(2, errorMessage)
      }
    } else if (currentStep === 3) {
      // For step 3, we don't need to handle refinement here anymore
      // Refinement is now handled directly in the Step3CodeGeneration component
      console.log(
        '✅ Already at final step. Refinement handled in Step3 component.'
      )
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
        return '📤 Analyze Project & Generate Questions'
      case 2:
        return '🚀 Generate Code'
      case 3:
        return '✨ Code Generated Successfully'
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
      <div className="alert alert-error alert-sm mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-4 w-4"
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
        <div className="flex justify-between items-center w-full">
          <span className="text-sm">{error}</span>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => clearStepError(step)}
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">AI Code Assistant</h1>
          <p className="text-base-content/70">
            Generate, refine, and improve your code with AI assistance
          </p>
        </div>

        <div className="mb-8">
          <ul className="steps w-full">
            {stepTitles.map((title, index) => (
              <li
                key={index + 1}
                className={`step ${
                  currentStep >= index + 1 ? `step-${stepColors[index]}` : ''
                } ${
                  canProceedToStep(index + 1) || currentStep > index + 1
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                }`}
                onClick={() => handleStepClick(index + 1)}
              >
                {title}
              </li>
            ))}
          </ul>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center mb-6">
              <div
                className={`badge badge-${
                  stepColors[currentStep - 1]
                } badge-lg mr-3`}
              >
                {currentStep}
              </div>
              <h2 className="card-title text-2xl">
                {stepTitles[currentStep - 1]}
              </h2>
            </div>

            {/* Render step-specific errors */}
            {renderStepError(currentStep)}

            <div className="mb-8">{renderStepContent()}</div>

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
                ← Previous
              </button>

              <div className="flex gap-2">
                {stepTitles.map((_, index) => (
                  <button
                    key={index}
                    className={`btn btn-xs ${
                      currentStep === index + 1
                        ? `btn-${stepColors[index]}`
                        : 'btn-outline'
                    }`}
                    onClick={() => handleStepClick(index + 1)}
                    disabled={
                      !canProceedToStep(index + 1) && currentStep <= index + 1
                    }
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {shouldShowNextButton() && (
                <button
                  className={`btn btn-${stepColors[currentStep - 1]} ${
                    stepErrors[currentStep] ? 'btn-disabled' : ''
                  }`}
                  onClick={handleNextStep}
                  disabled={isNextButtonDisabled() || !!stepErrors[currentStep]}
                >
                  {clarificationLoading || codeGenerationLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {codeGenerationLoading
                        ? 'Generating Code...'
                        : 'Processing...'}
                    </>
                  ) : (
                    <>{getStepButtonText()} →</>
                  )}
                </button>
              )}

              {currentStep === 3 && (
                <div className="text-sm text-base-content/70">
                  Use the refinement panel to improve your code
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global error display for code generation errors */}
        {codeGenerationError && currentStep === 3 && (
          <div className="mt-4">
            <div className="alert alert-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
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
                <div className="text-xs">{codeGenerationError}</div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => dispatch(clearError())}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AICodeAssistant
