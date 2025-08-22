import React, { useState } from 'react'
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

// Mock assessment interface to match Step1PromptRefinement
interface Assessment {
  score: number
  type: 'improvement' | 'excellent'
  content: {
    title: string
    items: string[]
  }
}

// Mock reference file assessment interface for Step2
interface ReferenceFileAssessment {
  score: number
  message: string
}

const AICodeAssistant: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [stepErrors, setStepErrors] = useState<{ [key: number]: string }>({})

  // Step 1 state
  const [localUserPrompt, setLocalUserPrompt] = useState<string>('')
  const [promptAssessment, setPromptAssessment] = useState<Assessment | null>(
    null
  )
  const [isAssessing, setIsAssessing] = useState(false)

  // Step 2 state
  const [referenceFileAssessment, setReferenceFileAssessment] =
    useState<ReferenceFileAssessment | null>(null)
  const [isAssessingFiles, setIsAssessingFiles] = useState(false)

  // Step 3 state
  const [refinePromptText, setRefinePromptText] = useState<string>('')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [codeGenerationError, setCodeGenerationError] = useState<string>('')

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

  // Mock assessment data (same as in Step1PromptRefinement)
  const mockAssessments: Assessment[] = [
    {
      score: 4,
      type: 'improvement',
      content: {
        title: 'Your prompt needs more detail',
        items: [
          'What specific features or functionality should be included?',
          'What technology stack or framework should be used?',
          'Are there any design preferences or constraints to consider?'
        ]
      }
    },
    {
      score: 9,
      type: 'excellent',
      content: {
        title: "Excellent prompt! Here's why:",
        items: [
          'Clear and specific requirements with detailed functionality description',
          'Includes technical specifications and implementation preferences',
          'Provides context about integration needs and existing system constraints'
        ]
      }
    }
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

  const setStepError = (step: number, error: string) => {
    setStepErrors((prev) => ({ ...prev, [step]: error }))
  }

  const clearStepError = (step: number) => {
    setStepErrors((prev) => ({ ...prev, [step]: '' }))
  }

  // Handle prompt assessment for Step 1
  const handleAssessPrompt = async () => {
    if (!localUserPrompt.trim()) {
      setStepError(1, 'Please enter a prompt first.')
      return
    }

    setIsAssessing(true)
    clearStepError(1)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Randomly select one of the mock assessments
    const randomAssessment =
      mockAssessments[Math.floor(Math.random() * mockAssessments.length)]
    setPromptAssessment(randomAssessment)
    setIsAssessing(false)
  }

  // Handle assessment callback from Step2
  const handleStep2AssessmentComplete = (assessment: {
    score: number
    message: string
  }) => {
    setReferenceFileAssessment(assessment)
    setIsAssessingFiles(false)
  }
  const handleGenerateCode = async () => {
    setIsGeneratingCode(true)
    clearStepError(3)
    setCodeGenerationError('')

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate occasional errors for demo
      if (Math.random() < 0.1) {
        throw new Error(
          'Failed to generate code. Please check your connection and try again.'
        )
      }

      setCurrentStep(3)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate code. Please try again.'

      setCodeGenerationError(errorMessage)
      setStepError(2, errorMessage)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleNextStep = async () => {
    // Clear any existing errors for current step
    clearStepError(currentStep)

    if (currentStep === 2) {
      await handleGenerateCode()
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
        return (
          localUserPrompt.trim() !== '' &&
          promptAssessment !== null &&
          promptAssessment.score >= 7
        )
      case 3:
        return (
          referenceFileAssessment !== null && referenceFileAssessment.score >= 7
        )
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PromptRefinement
            userPrompt={localUserPrompt}
            setUserPrompt={setLocalUserPrompt}
            assessment={promptAssessment}
            isAssessing={isAssessing}
            onAssessPrompt={handleAssessPrompt}
            onNavigateToStep2={() => setCurrentStep(2)}
          />
        )
      case 2:
        return (
          <Step2PromptClarification
            onAssessmentComplete={handleStep2AssessmentComplete}
          />
        )
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

  const shouldShowNextButton = () => {
    // Only show the main next button for step 2 when ready to generate code
    return (
      currentStep === 2 &&
      referenceFileAssessment &&
      referenceFileAssessment.score >= 7
    )
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
    if (currentStep === 1 && isAssessing) {
      return {
        title: 'Assessing Your Prompt',
        message: 'AI is analyzing your prompt quality and providing feedback...'
      }
    } else if (currentStep === 2 && isGeneratingCode) {
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
          isOpen={isAssessing || isGeneratingCode}
          title={loadingConfig.title}
          message={loadingConfig.message}
        />
      )}

      {/* Header Spacer - same height, empty */}
      <div className="h-12 bg-base-200" />

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
              disabled={currentStep === 1 || isAssessing || isGeneratingCode}
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
                disabled={!!stepErrors[currentStep]}
              >
                {isGeneratingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Code...
                  </>
                ) : (
                  <>
                    Generate Code
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            ) : currentStep === 3 ? (
              <div className="flex items-center text-primary">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  Code generation complete!
                </span>
              </div>
            ) : (
              <div></div>
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
                onClick={() => setCodeGenerationError('')}
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
