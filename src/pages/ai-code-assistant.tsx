import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/shared/store/hook'
import { refinePrompt } from '@/features/aiCodeAssistant/promptClarification/state/promptClarificationSlice'
import {
  Step1PromptRefinement,
  Step2PromptClarification,
  Step3CodeGeneration
} from '@/features/aiCodeAssistant/steps'

interface CodeResponse {
  explanation: string
  code: string
  language: string
}

const AICodeAssistant: React.FC = () => {
  const dispatch = useAppDispatch()
  const { userPrompt, projectFilePaths } = useAppSelector(
    (state) => state.promptRefinement
  )
  const {
    clarifyingQuestionsWithAnswers,
    additionalNotes,
    manuallyAddedFiles,
    selectedRelevantFiles,
    loading
  } = useAppSelector((state) => state.promptClarification)

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [codeResponse, setCodeResponse] = useState<CodeResponse | null>(null)
  const [refinePromptText, setRefinePromptText] = useState<string>('')

  const stepTitles = [
    'Refine Prompt',
    'Clarify & Select Files',
    'Generate & Refine Code'
  ]
  const stepColors = ['primary', 'success', 'secondary']

  const handleNextStep = async () => {
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
          console.error('Failed to refine prompt:', error)
        }
      } else {
        alert('Please enter a prompt and select a project folder first.')
        return
      }
    } else if (currentStep === 2) {
      // Prepare data for code generation
      const allSelectedFiles = [...selectedRelevantFiles, ...manuallyAddedFiles]

      // Here you would typically send the data to your code generation API
      const codeGenerationData = {
        userPrompt,
        clarifyingQuestionsWithAnswers,
        additionalNotes,
        selectedFiles: allSelectedFiles
      }

      console.log('Code generation data:', codeGenerationData)

      setCurrentStep(3)
      setCodeResponse({
        explanation:
          "Based on your project structure and requirements, I'll generate the appropriate code.",
        code: '// Your generated code will appear here\n// Based on your answers and selected files',
        language: 'typescript'
      })
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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
            codeResponse={codeResponse}
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
        return '✨ Continue Refining'
      default:
        return 'Continue'
    }
  }

  const isNextButtonDisabled = () => {
    if (loading) return true

    switch (currentStep) {
      case 1:
        return !userPrompt.trim() || projectFilePaths.length === 0
      case 2:
        return (
          clarifyingQuestionsWithAnswers.length === 0 ||
          clarifyingQuestionsWithAnswers.some((qa) => qa.answer.trim() === '')
        )
      case 3:
        return !refinePromptText.trim()
      default:
        return false
    }
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
                disabled={currentStep === 1 || loading}
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

              <button
                className={`btn btn-${stepColors[currentStep - 1]}`}
                onClick={currentStep === 3 ? undefined : handleNextStep}
                disabled={isNextButtonDisabled()}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {currentStep === 3
                      ? getStepButtonText()
                      : `${getStepButtonText()} →`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICodeAssistant
