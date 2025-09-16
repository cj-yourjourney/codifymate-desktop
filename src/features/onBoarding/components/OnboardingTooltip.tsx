// Optional: Enhanced onboarding tooltip with exit option
// components/onboarding/components/OnboardingTooltip.tsx
import React from 'react'
import { Lightbulb, X, Home } from 'lucide-react'
import { Tooltip } from '../types/onboarding'
import { navigateTo, ROUTES } from '@/shared/components/HashRouter'

interface OnboardingTooltipProps {
  tooltip: Tooltip
  currentStep: number
  onClose: () => void
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  tooltip,
  currentStep,
  onClose
}) => {
  const handleGoHome = () => {
    navigateTo(ROUTES.INDEX)
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-4 h-4" />
          <h4 className="font-medium text-sm">{tooltip.title}</h4>
        </div>
        <button onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs mb-2 text-blue-100">{tooltip.content}</p>
      <p className="text-xs text-blue-200 italic mb-3">{tooltip.example}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-blue-200">Step {currentStep} of 3</span>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="text-xs bg-white/20 px-2 py-1 rounded"
          >
            Got it
          </button>
          <button
            onClick={handleGoHome}
            className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 flex items-center space-x-1"
          >
            <Home className="w-3 h-3" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  )
}
