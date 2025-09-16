import React from 'react'
import { useOnboardingState } from '../hooks/useOnboardingState'
import { tooltips } from '../constants/mockData'
import { OnboardingTooltip } from './OnboardingTooltip'
import { OnboardingHeader } from './OnboardingHeader'
import { OnboardingNavigation } from './OnboardingNavigation'
import { CompletionMessage } from './CompletionMessage'
import { OnboardingStep1 } from './steps/OnboardingStep1'
import { OnboardingStep2 } from './steps/OnboardingStep2'
import { OnboardingStep3 } from './steps/OnboardingStep3'
import { OnboardingStep } from '../types/onboarding'

const OnboardingComponent: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    showTooltip,
    setShowTooltip,
    userPrompt,
    setUserPrompt,
    isAssessing,
    setIsAssessing,
    assessment,
    setAssessment,
    projectPath,
    setProjectPath,
    selectedFiles,
    setSelectedFiles,
    expandedFiles,
    setExpandedFiles,
    refinePrompt,
    setRefinePrompt,
    currentAnimation,
    setCurrentAnimation,
    resetState
  } = useOnboardingState()

  const handleSkip = () => {
    // Fix: Properly type cast the next step
    const nextStep: OnboardingStep =
      currentStep < 3 ? ((currentStep + 1) as OnboardingStep) : 1
    setCurrentStep(nextStep)
  }

  const handleShowTooltip = () => {
    setShowTooltip(true)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            isAssessing={isAssessing}
            setIsAssessing={setIsAssessing}
            assessment={assessment}
            setAssessment={setAssessment}
            currentAnimation={currentAnimation}
            setCurrentAnimation={setCurrentAnimation}
            onContinue={() => setCurrentStep(2)}
          />
        )
      case 2:
        return (
          <OnboardingStep2
            projectPath={projectPath}
            setProjectPath={setProjectPath}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            onContinue={() => setCurrentStep(3)}
          />
        )
      case 3:
        return (
          <OnboardingStep3
            expandedFiles={expandedFiles}
            setExpandedFiles={setExpandedFiles}
            refinePrompt={refinePrompt}
            setRefinePrompt={setRefinePrompt}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Tooltip */}
      {showTooltip && (
        <OnboardingTooltip
          tooltip={tooltips[currentStep]}
          currentStep={currentStep}
          onClose={() => setShowTooltip(false)}
        />
      )}

      {/* Header */}
      <OnboardingHeader
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onShowTooltip={handleShowTooltip}
        onSkip={handleSkip}
      />

      {/* Main Content */}
      <div className="py-8 px-6">{renderStep()}</div>

      {/* Bottom Navigation */}
      <OnboardingNavigation
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onReset={resetState}
      />

      {/* Completion Message */}
      <CompletionMessage show={currentStep === 3} />
    </div>
  )
}

export default OnboardingComponent
