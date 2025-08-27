import React, { useState } from 'react'
import {
  Step1PromptRefinement,
  Step2PromptClarification,
  Step3CodeGeneration
} from '@/features/aiCodeAssistant/steps'
import LoadingModal from '@/shared/components/LoadingModal'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  assessPrompt,
  clearAssessment
} from '@/features/aiCodeAssistant/promptRefinement/state/promptAssessmentSlice'
import { Edit3, HelpCircle, Code, Check, AlertCircle, X } from 'lucide-react'

// Mock reference file assessment interface for Step2
interface ReferenceFileAssessment {
  score: number
  message: string
}

const AICodeAssistant: React.FC = () => {
  // Redux state and actions
  const dispatch = useAppDispatch()
  const {
    assessment: promptAssessment,
    isLoading: isAssessing,
    error: assessmentError
  } = useAppSelector((state) => state.promptAssessment)

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [stepErrors, setStepErrors] = useState<{ [key: number]: string }>({})

  // Step 1 state
  const [localUserPrompt, setLocalUserPrompt] = useState<string>('')

  // Step 2 state
  const [referenceFileAssessment, setReferenceFileAssessment] =
    useState<ReferenceFileAssessment | null>(null)
  const [isAssessingFiles, setIsAssessingFiles] = useState(false)

  // Step 3 state
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [codeGenerationError, setCodeGenerationError] = useState<string>('')

  const steps = [
    {
      id: 1,
      title: 'Write Prompt',
      subtitle: 'Describe your requirements',
      icon: Edit3
    },
    {
      id: 2,
      title: 'Add Details & Files',
      subtitle: 'Provide context and references',
      icon: HelpCircle
    },
    {
      id: 3,
      title: 'Generate & Refine',
      subtitle: 'Create optimized code',
      icon: Code
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

  // Handle assessment errors from Redux
  React.useEffect(() => {
    if (assessmentError) {
      setStepError(1, assessmentError)
    }
  }, [assessmentError])

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

    clearStepError(1)
    dispatch(assessPrompt({ user_prompt: localUserPrompt.trim() }))
  }

  // Modified: Handle step navigation to step 2 from step 1 - now only requires assessment to exist
  const handleNavigateToStep2 = () => {
    if (promptAssessment !== null) {
      clearStepError(1)
      setCurrentStep(2)
    }
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

  const handleStepClick = (stepId: number) => {
    if (canNavigateToStep(stepId)) {
      clearStepError(currentStep)
      setCurrentStep(stepId)
    }
  }

  // Modified: Updated navigation logic to allow Step 2 access after any assessment
  const canNavigateToStep = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return true
      case 2:
        // Modified: Only requires prompt and any assessment (regardless of score)
        return localUserPrompt.trim() !== '' && promptAssessment !== null
      case 3:
        return (
          (referenceFileAssessment !== null &&
            referenceFileAssessment.score >= 7) ||
          currentStep >= 3
        )
      default:
        return false
    }
  }

  const getStepStatus = (stepId: number) => {
    if (currentStep === stepId) return 'active'
    if (currentStep > stepId) return 'completed'
    if (canNavigateToStep(stepId)) return 'available'
    return 'disabled'
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
            onNavigateToStep2={handleNavigateToStep2}
          />
        )
      case 2:
        return (
          <Step2PromptClarification
            onGenerateCode={handleGenerateCode}
            isGeneratingCode={isGeneratingCode}
            onReferenceFileAssessment={setReferenceFileAssessment}
          />
        )
      case 3:
        return <Step3CodeGeneration />
      default:
        return null
    }
  }

  const renderStepError = (step: number) => {
    const error = stepErrors[step]
    if (!error) return null

    return (
      <div className="mx-6 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button
              className="text-red-400 hover:text-red-600 transition-colors"
              onClick={() => clearStepError(step)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Loading Modal */}
      {loadingConfig && (
        <LoadingModal
          isOpen={isAssessing || isGeneratingCode}
          title={loadingConfig.title}
          message={loadingConfig.message}
        />
      )}

      {/* Header with Integrated Step Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* App Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              AI Code Assistant
            </h1>
            <p className="text-gray-600">
              Transform your ideas into optimized code in three simple steps
            </p>
          </div>

          {/* Enhanced Step Navigation */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id)
                const Icon = step.icon
                const isClickable = status !== 'disabled'

                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step Button */}
                    <button
                      onClick={() => isClickable && handleStepClick(step.id)}
                      disabled={!isClickable}
                      className={`group flex items-center transition-all duration-300 ${
                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      {/* Step Circle */}
                      <div
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                          status === 'completed'
                            ? 'border-green-500 bg-green-500 text-white shadow-md'
                            : status === 'active'
                            ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-110'
                            : status === 'available'
                            ? 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-400 hover:bg-blue-100'
                            : 'border-gray-200 bg-gray-50 text-gray-400'
                        }`}
                      >
                        {status === 'completed' ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}

                        {/* Active Step Pulse */}
                        {status === 'active' && (
                          <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-75"></div>
                        )}
                      </div>

                      {/* Step Info */}
                      <div className="ml-4 text-left">
                        <div
                          className={`text-sm font-semibold transition-colors ${
                            status === 'active'
                              ? 'text-blue-600'
                              : status === 'completed'
                              ? 'text-green-600'
                              : status === 'available'
                              ? 'text-gray-700 group-hover:text-blue-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div
                          className={`text-xs transition-colors ${
                            status === 'active'
                              ? 'text-blue-500'
                              : status === 'completed'
                              ? 'text-green-500'
                              : status === 'available'
                              ? 'text-gray-500 group-hover:text-blue-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.subtitle}
                        </div>
                      </div>
                    </button>

                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className="mx-6">
                        <div
                          className={`w-16 h-0.5 transition-colors duration-300 ${
                            currentStep > step.id
                              ? 'bg-green-300'
                              : currentStep === step.id
                              ? 'bg-blue-300'
                              : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Status Indicator */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  stepErrors[currentStep]
                    ? 'bg-red-400'
                    : currentStep === 3
                    ? 'bg-green-400'
                    : 'bg-blue-400'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {stepErrors[currentStep]
                  ? 'Action Required'
                  : currentStep === 3
                  ? 'Ready to Generate'
                  : `Step ${currentStep} of ${steps.length}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-specific Error Display */}
      {stepErrors[currentStep] && renderStepError(currentStep)}

      {/* Main Content Area */}
      <div className="flex-1">{renderStepContent()}</div>

      {/* Global error display for code generation errors */}
      {codeGenerationError && currentStep === 3 && (
        <div className="fixed bottom-6 left-6 right-6 z-50">
          <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-3" />
                <div>
                  <h4 className="font-medium text-amber-800">
                    Code Generation Issue
                  </h4>
                  <p className="text-sm text-amber-700">
                    {codeGenerationError}
                  </p>
                </div>
              </div>
              <button
                className="text-amber-400 hover:text-amber-600 ml-4"
                onClick={() => setCodeGenerationError('')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AICodeAssistant
