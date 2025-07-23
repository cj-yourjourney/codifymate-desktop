import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface FileToModify {
  file_path: string
  change_type: string
  code: string
  description: string
}

interface GeneratedCodeResponse {
  explanation: string
  files_to_modify: FileToModify[]
  additional_notes: string
}

interface GeneratedCodeVersion {
  id: string
  version: string
  timestamp: string
  explanation: string
  files_to_modify: FileToModify[]
  additional_notes: string
  refinement_prompt?: string // Track what refinement was requested
}

interface CodeGenerationPayload {
  user_prompt: string
  clarifying_questions_with_answers: Array<{
    question: string
    answer: string
  }>
  context_files: Array<{
    file_path: string
    content: string
  }>
  additional_notes: string
  project_structure: {
    type: string
    root: string
    structure: {
      root_files: string[]
    }
    conventions: Record<string, any>
    framework: Record<string, any>
  }
}

interface CodeRefinementPayload {
  current_version: GeneratedCodeVersion
  refinement_feedback: string
  context_files: Array<{
    file_path: string
    content: string
  }>
  project_structure: {
    type: string
    root: string
    structure: {
      root_files: string[]
    }
    conventions: Record<string, any>
    framework: Record<string, any>
  }
}

interface CodeGenerationState {
  generatedCodeVersions: GeneratedCodeVersion[]
  currentVersion: GeneratedCodeVersion | null
  loading: boolean
  error: string | null
  refining: boolean // Separate loading state for refinement
}

const initialState: CodeGenerationState = {
  generatedCodeVersions: [],
  currentVersion: null,
  loading: false,
  error: null,
  refining: false
}

// Async thunk to generate code
export const generateCode = createAsyncThunk(
  'codeGeneration/generateCode',
  async (payload: {
    userPrompt: string
    clarifyingQuestionsWithAnswers: Array<{ question: string; answer: string }>
    selectedRelevantFiles: Array<{ filePath: string; content: string }>
    manuallyAddedFiles: Array<{ filePath: string; content: string }>
    additionalNotes: string
    projectStructure: {
      type: string
      root: string
      structure: { root_files: string[] }
      conventions: Record<string, any>
      framework: Record<string, any>
    }
  }) => {
    // Combine selected files and manually added files
    const contextFiles = [
      ...payload.selectedRelevantFiles,
      ...payload.manuallyAddedFiles
    ].map((file) => ({
      file_path: file.filePath,
      content: file.content
    }))

    // Transform to snake_case and prepare the request payload
    const requestPayload: CodeGenerationPayload = {
      user_prompt: payload.userPrompt,
      clarifying_questions_with_answers: payload.clarifyingQuestionsWithAnswers,
      context_files: contextFiles,
      additional_notes: payload.additionalNotes,
      project_structure: payload.projectStructure
    }

    console.log('Sending request to generate code:', requestPayload)

    const response = await fetch(
      'http://127.0.0.1:8000/api/prompt/generate-code/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received response from generate code:', data)
    return data
  }
)

// Async thunk to refine code
export const refineCode = createAsyncThunk(
  'codeGeneration/refineCode',
  async (payload: {
    currentVersion: GeneratedCodeVersion
    refinementFeedback: string
    selectedRelevantFiles: Array<{ filePath: string; content: string }>
    manuallyAddedFiles: Array<{ filePath: string; content: string }>
    projectStructure: {
      type: string
      root: string
      structure: { root_files: string[] }
      conventions: Record<string, any>
      framework: Record<string, any>
    }
  }) => {
    // For now, we'll use mock data since endpoint doesn't exist yet
    console.log('Refining code with payload:', payload)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock refined response
    const mockRefinedCode: GeneratedCodeResponse = {
      explanation: `Refined version based on: "${payload.refinementFeedback}". Added improvements including better error handling, loading states, and code optimization.`,
      files_to_modify: payload.currentVersion.files_to_modify.map(
        (file, index) => ({
          ...file,
          code: `${file.code}\n\n// REFINED: ${payload.refinementFeedback}\n// Added improvements based on user feedback`,
          description: `${file.description} (Refined with: ${payload.refinementFeedback})`
        })
      ),
      additional_notes: `Previous version notes: ${payload.currentVersion.additional_notes}\n\nRefinement applied: ${payload.refinementFeedback}`
    }

    // TODO: Replace with actual API call when endpoint is ready
    /*
    const contextFiles = [
      ...payload.selectedRelevantFiles,
      ...payload.manuallyAddedFiles
    ].map((file) => ({
      file_path: file.filePath,
      content: file.content
    }))

    const requestPayload: CodeRefinementPayload = {
      current_version: payload.currentVersion,
      refinement_feedback: payload.refinementFeedback,
      context_files: contextFiles,
      project_structure: payload.projectStructure
    }

    const response = await fetch(
      'http://127.0.0.1:8000/api/prompt/refine-code/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
    */

    return {
      success: true,
      generated_code: mockRefinedCode
    }
  }
)

const codeGenerationSlice = createSlice({
  name: 'codeGeneration',
  initialState,
  reducers: {
    resetCodeGeneration: () => initialState,
    setCurrentVersion: (state, action: PayloadAction<string>) => {
      const version = state.generatedCodeVersions.find(
        (v) => v.id === action.payload
      )
      if (version) {
        state.currentVersion = version
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Code cases
      .addCase(generateCode.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateCode.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success) {
          const newVersion: GeneratedCodeVersion = {
            id: Date.now().toString(),
            version: `v1.${state.generatedCodeVersions.length}`,
            timestamp: new Date().toISOString(),
            explanation: action.payload.generated_code.explanation,
            files_to_modify: action.payload.generated_code.files_to_modify,
            additional_notes: action.payload.generated_code.additional_notes
          }

          state.generatedCodeVersions.push(newVersion)
          state.currentVersion = newVersion
        }
      })
      .addCase(generateCode.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to generate code'
      })
      // Refine Code cases
      .addCase(refineCode.pending, (state) => {
        state.refining = true
        state.error = null
      })
      .addCase(refineCode.fulfilled, (state, action) => {
        state.refining = false
        if (action.payload.success) {
          const newVersion: GeneratedCodeVersion = {
            id: Date.now().toString(),
            version: `v1.${state.generatedCodeVersions.length}`,
            timestamp: new Date().toISOString(),
            explanation: action.payload.generated_code.explanation,
            files_to_modify: action.payload.generated_code.files_to_modify,
            additional_notes: action.payload.generated_code.additional_notes,
            refinement_prompt: action.meta.arg.refinementFeedback
          }

          state.generatedCodeVersions.push(newVersion)
          state.currentVersion = newVersion
        }
      })
      .addCase(refineCode.rejected, (state, action) => {
        state.refining = false
        state.error = action.error.message || 'Failed to refine code'
      })
  }
})

export const { resetCodeGeneration, setCurrentVersion, clearError } =
  codeGenerationSlice.actions

export default codeGenerationSlice.reducer
