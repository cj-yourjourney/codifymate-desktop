// utils/stepUtils.ts
import { StepStatus } from '../types/onboarding'

export const getStepStatus = (
  stepId: number,
  currentStep: number
): StepStatus => {
  if (currentStep === stepId) return 'active'
  if (currentStep > stepId) return 'completed'
  return 'available'
}
