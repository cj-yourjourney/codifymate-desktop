import React, { useState } from 'react'
import {
  Step1PromptRefinement,
  Step2RelevantFiles,
  Step3CodeGeneration
} from '@/features/aiCodeAssistant/steps'
import LoadingModal from '@/shared/components/LoadingModal'
import { useAppDispatch, useAppSelector } from '@/shared/store/hook'
import { assessPrompt } from '@/features/aiCodeAssistant/promptRefinement/state/promptAssessmentSlice'
import { Edit3, HelpCircle, Code, Check } from 'lucide-react'

const AICodeAssistant: React.FC = () => {
  const dispatch = useAppDispatch()
  const { assessment: promptAssessment, isLoading: isAssessing } =
    useAppSelector((state) => state.promptAssessment)

  const { relevantFiles, isAnalyzing } = useAppSelector(
    (state) => state.relevantFiles
  )

  const [currentStep, setCurrentStep] = useState(1)
  const [userPrompt, setUserPrompt] = useState('')

  const steps = [
    { id: 1, title: 'Prompt', icon: Edit3 },
    { id: 2, title: 'Files', icon: HelpCircle },
    { id: 3, title: 'Code', icon: Code }
  ]

  const handleAssessPrompt = () => {
    if (userPrompt.trim()) {
      dispatch(assessPrompt({ user_prompt: userPrompt.trim() }))
    }
  }

  const canNavigate = (stepId: number) => {
    switch (stepId) {
      case 1:
        return true
      case 2:
        return userPrompt.trim() && promptAssessment !== null
      case 3:
        return relevantFiles.length > 0 || currentStep >= 3
      default:
        return false
    }
  }

  const getStepStatus = (stepId: number) => {
    if (currentStep === stepId) return 'active'
    if (currentStep > stepId) return 'completed'
    if (canNavigate(stepId)) return 'available'
    return 'disabled'
  }

  const getLoadingConfig = () => {
    if (isAssessing)
      return {
        title: 'Assessing Prompt',
        message: 'Analyzing prompt quality...'
      }
    if (isAnalyzing)
      return {
        title: 'Analyzing Files',
        message: 'Identifying relevant files...'
      }
    return null
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PromptRefinement
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            assessment={promptAssessment}
            isAssessing={isAssessing}
            onAssessPrompt={handleAssessPrompt}
            onNavigateToStep2={() => setCurrentStep(2)}
          />
        )
      case 2:
        return <Step2RelevantFiles onContinue={() => setCurrentStep(3)} />
      case 3:
        return <Step3CodeGeneration />
      default:
        return null
    }
  }

  const loadingConfig = getLoadingConfig()

  return (
    <div className="min-h-screen bg-gray-50">
      {loadingConfig && (
        <LoadingModal
          isOpen={isAssessing || isAnalyzing}
          title={loadingConfig.title}
          message={loadingConfig.message}
        />
      )}

      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-center items-center space-x-6">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              const Icon = step.icon
              const clickable = status !== 'disabled'

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => clickable && setCurrentStep(step.id)}
                    disabled={!clickable}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                      status === 'active'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : status === 'available'
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        status === 'completed'
                          ? 'bg-green-500 text-white'
                          : status === 'active'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {status === 'completed' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon className="w-3 h-3" />
                      <span className="text-xs">{step.title}</span>
                    </div>
                  </button>

                  {index < steps.length - 1 && (
                    <div className="mx-3">
                      <div
                        className={`w-6 h-0.5 ${
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

      <div className="py-8 px-6">{renderStep()}</div>
    </div>
  )
}

export default AICodeAssistant
