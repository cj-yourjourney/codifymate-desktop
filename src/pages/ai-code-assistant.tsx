import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import { refinePrompt } from '@/features/aiCodeAssistant/promptClarification/state/promptClarificationSlice'
import { generateCode } from '@/features/aiCodeAssistant/codeGeneration/state/codeGenerationSlice'
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
    refining
  } = codeGenerationState

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [refinePromptText, setRefinePromptText] = useState<string>('')

  const stepTitles = [
    'Refine Prompt',
    'Clarify & Select Files',
    'Generate & Refine Code'
  ]
  const stepColors = ['primary', 'success', 'secondary']

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
        }
      } else {
        alert('Please enter a prompt and select a project folder first.')
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
        console.error('❌ Error details:', error)
        alert(
          `Failed to generate code: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        )
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
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleStepClick = (step: number) => {
    if (
      step <= currentStep ||
      (step === currentStep + 1 && canProceedToStep(step))
    ) {
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
                  className={`btn btn-${stepColors[currentStep - 1]}`}
                  onClick={handleNextStep}
                  disabled={isNextButtonDisabled()}
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
      </div>
    </div>
  )
}

export default AICodeAssistant
