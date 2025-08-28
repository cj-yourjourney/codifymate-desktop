import React, { useState } from 'react'
import {
  Step1PromptRefinement,
  Step2RelevantFiles,
  Step3CodeGeneration
} from '@/features/aiCodeAssistant/steps'
import LoadingModal from '@/shared/components/LoadingModal'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import {
  assessPrompt,
  clearAssessment
} from '@/features/aiCodeAssistant/promptRefinement/state/promptAssessmentSlice'
import { Edit3, HelpCircle, Code, Check } from 'lucide-react'

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
  const [localUserPrompt, setLocalUserPrompt] = useState<string>('')
  const [referenceFileAssessment, setReferenceFileAssessment] =
    useState<ReferenceFileAssessment | null>(null)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)

  const steps = [
    { id: 1, title: 'Write Prompt', icon: Edit3 },
    { id: 2, title: 'Add Files', icon: HelpCircle },
    { id: 3, title: 'Generate Code', icon: Code }
  ]

  // Handle prompt assessment for Step 1
  const handleAssessPrompt = async () => {
    if (!localUserPrompt.trim()) return
    dispatch(assessPrompt({ user_prompt: localUserPrompt.trim() }))
  }

  const handleNavigateToStep2 = () => {
    if (promptAssessment !== null) {
      setCurrentStep(2)
    }
  }

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (Math.random() < 0.1) {
        throw new Error(
          'Failed to generate code. Please check your connection and try again.'
        )
      }

      setCurrentStep(3)
    } catch (error) {
      // Handle error if needed
      console.error('Code generation failed:', error)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleStepClick = (stepId: number) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId)
    }
  }

  const canNavigateToStep = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return true
      case 2:
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
          <Step2RelevantFiles
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Modal */}
      {loadingConfig && (
        <LoadingModal
          isOpen={isAssessing || isGeneratingCode}
          title={loadingConfig.title}
          message={loadingConfig.message}
        />
      )}

      {/* Minimal Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* App Title */}

          {/* Simple Step Navigation */}
          <div className="flex justify-center items-center space-x-8">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              const Icon = step.icon
              const isClickable = status !== 'disabled'

              return (
                <div key={step.id} className="flex items-center">
                  {/* Step */}
                  <button
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all ${
                      status === 'active'
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : status === 'available'
                        ? 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        status === 'completed'
                          ? 'bg-green-500 text-white'
                          : status === 'active'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {status === 'completed' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{step.title}</span>
                    </div>
                  </button>

                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div className="mx-4">
                      <div
                        className={`w-8 h-0.5 ${
                          currentStep > step.id ? 'bg-green-300' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-6">{renderStepContent()}</div>
    </div>
  )
}

export default AICodeAssistant
