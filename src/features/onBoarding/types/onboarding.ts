// types/onboarding.ts
export interface Step {
  id: number
  title: string
  icon: any
}

export interface MockAssessment {
  score: number
  category: string
  content: {
    title: string
    items: string[]
  }
}

export interface MockGeneratedFile {
  file_path: string
  change_type: 'create' | 'modify'
  code: string
}

export interface MockGeneratedCode {
  explanation: string
  files_to_modify: MockGeneratedFile[]
}

export interface Tooltip {
  title: string
  content: string
  example: string
}

export type StepStatus = 'active' | 'completed' | 'available'
