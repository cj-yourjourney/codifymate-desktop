// hooks/useOnboardingState.ts
import { useState } from 'react'

export const useOnboardingState = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showTooltip, setShowTooltip] = useState(true)
  const [userPrompt, setUserPrompt] = useState('')
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessment, setAssessment] = useState(null)
  const [projectPath, setProjectPath] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [expandedFiles, setExpandedFiles] = useState(new Set(['0']))
  const [refinePrompt, setRefinePrompt] = useState('')
  const [currentAnimation, setCurrentAnimation] = useState(0)

  const resetState = () => {
    setCurrentStep(1)
    setUserPrompt('')
    setAssessment(null)
    setProjectPath('')
    setSelectedFiles([])
    setRefinePrompt('')
    setExpandedFiles(new Set(['0']))
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
