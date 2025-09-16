// components/onboarding/components/OnboardingNavigation.tsx
import React from 'react'
import { ArrowRight, Home } from 'lucide-react'
import { navigateTo, ROUTES } from '@/shared/components/HashRouter'

interface OnboardingNavigationProps {
  currentStep: number
  setCurrentStep: (step: number) => void
  onReset: () => void
}

export const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  currentStep,
  setCurrentStep,
  onReset
}) => {
  const steps = [1, 2, 3]

  const handleGoHome = () => {
    navigateTo(ROUTES.INDEX)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>Previous</span>
          </button>

          <button
            onClick={handleGoHome}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <Home className="w-3 h-3" />
            <span>Exit Demo</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {steps.map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step === currentStep
                  ? 'bg-blue-500'
                  : step < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (currentStep < 3) {
              setCurrentStep(currentStep + 1)
            } else {
              onReset()
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-1"
        >
          <span>{currentStep === 3 ? 'Start Over' : 'Next'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
