// hooks/useOnboardingState.ts
import { useState } from 'react'
import { MockAssessment, OnboardingStep } from '../types/onboarding'

export const useOnboardingState = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [showTooltip, setShowTooltip] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const [isAssessing, setIsAssessing] = useState(false)

  const [assessment, setAssessment] = useState<MockAssessment | null>(null)

  const [projectPath, setProjectPath] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [refinePrompt, setRefinePrompt] = useState('')
  const [currentAnimation, setCurrentAnimation] = useState(0)

  const resetState = () => {
    setCurrentStep(1)
    setShowTooltip(false)
    setUserPrompt('')
    setIsAssessing(false)
    setAssessment(null)
    setProjectPath('')
    setSelectedFiles([])
    setExpandedFiles(new Set())
    setRefinePrompt('')
    setCurrentAnimation(0)
  }

  return {
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
  }
}
