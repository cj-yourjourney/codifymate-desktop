// index.ts - Main export file
export { default as OnboardingComponent } from './components/OnboardingComponent'
export { OnboardingStep1 } from './components/steps/OnboardingStep1'
export { OnboardingStep2 } from './components/steps/OnboardingStep2'
export { OnboardingStep3 } from './components/steps/OnboardingStep3'
export { OnboardingTooltip } from './components/OnboardingTooltip'
export { OnboardingHeader } from './components/OnboardingHeader'
export { OnboardingNavigation } from './components/OnboardingNavigation'
export { CompletionMessage } from './components/CompletionMessage'

// Hooks
export { useOnboardingState } from './hooks/useOnboardingState'

// Types
export type {
  Step,
  MockAssessment,
  MockGeneratedFile,
  MockGeneratedCode,
  Tooltip,
  StepStatus
} from './types/onboarding'

// Constants
export {
  mockAssessment,
  mockFiles,
  mockGeneratedCode,
  tooltips
} from './constants/mockData'

// Utils
export { getStepStatus } from './utils/stepUtils'
