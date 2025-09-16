// components/onboarding/components/OnboardingHeader.tsx
import React from 'react'
import {
  Edit3,
  HelpCircle,
  Code,
  Check,
  Lightbulb,
  SkipForward,
  Home,
  X
} from 'lucide-react'
import { Step, OnboardingStep } from '../types/onboarding'
import { getStepStatus } from '../utils/stepUtils'
import { navigateTo, ROUTES } from '@/shared/components/HashRouter'

interface OnboardingHeaderProps {
  currentStep: OnboardingStep
  setCurrentStep: (step: OnboardingStep) => void
  onShowTooltip: () => void
  onSkip: () => void
}

const steps: Step[] = [
  { id: 1, title: 'Prompt', icon: Edit3 },
  { id: 2, title: 'Files', icon: HelpCircle },
  { id: 3, title: 'Code', icon: Code }
]

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  currentStep,
  setCurrentStep,
  onShowTooltip,
  onSkip
}) => {
  const handleGoHome = () => {
    navigateTo(ROUTES.INDEX)
  }

  const handleStepClick = (stepId: number) => {
    // Type guard to ensure we only pass valid OnboardingStep values
    if (stepId === 1 || stepId === 2 || stepId === 3) {
      setCurrentStep(stepId as OnboardingStep)
    }
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {/* Home/Close button */}
            <button
              onClick={handleGoHome}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Home"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Code Assistant Demo
              </h1>
              <p className="text-sm text-gray-600">
                Learn how to use the assistant in 3 simple steps
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onShowTooltip}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Show Tips</span>
            </button>
            <button
              onClick={onSkip}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center space-x-1"
            >
              <SkipForward className="w-3 h-3" />
              <span>Skip</span>
            </button>
            <button
              onClick={handleGoHome}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1"
            >
              <Home className="w-3 h-3" />
              <span>Home</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center space-x-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id, currentStep)
            const Icon = step.icon

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                    status === 'active'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
  )
}
