import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API_ENDPOINTS, apiRequest } from '@/shared/api/config'

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

    const data = await apiRequest(API_ENDPOINTS.GENERATE_CODE, {
      method: 'POST',
      body: JSON.stringify(requestPayload)
    })

    console.log('Received response from generate code:', data)
    return data
  }
)

// Updated async thunk to refine code using the real endpoint
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
    console.log('Refining code with payload:', payload)

    // Combine selected files and manually added files for context
    const contextFiles = [
      ...payload.selectedRelevantFiles,
      ...payload.manuallyAddedFiles
    ].map((file) => ({
      file_path: file.filePath,
      content: file.content
    }))

    // Prepare the request payload matching the Django endpoint structure
    const requestPayload = {
      current_version: {
        id: payload.currentVersion.id,
        version: payload.currentVersion.version,
        timestamp: payload.currentVersion.timestamp,
        explanation: payload.currentVersion.explanation,
        files_to_modify: payload.currentVersion.files_to_modify,
        additional_notes: payload.currentVersion.additional_notes,
        refinement_prompt: payload.refinementFeedback
      },
      refinement_feedback: payload.refinementFeedback,
      // context_files: contextFiles,
      project_structure: payload.projectStructure
    }

    console.log('Sending refinement request:', requestPayload)

    const data = await apiRequest(API_ENDPOINTS.REFINE_CODE, {
      method: 'POST',
      body: JSON.stringify(requestPayload)
    })

    console.log('Received refinement response:', data)

    if (!data.success) {
      throw new Error(data.error || 'Refinement failed')
    }

    return data
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
        } else {
          state.error = action.payload.error || 'Code generation failed'
        }
      })
      .addCase(generateCode.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to generate code'
      })
      // Refine Code cases - Updated to handle real API response
      .addCase(refineCode.pending, (state) => {
        state.refining = true
        state.error = null
      })
      .addCase(refineCode.fulfilled, (state, action) => {
        state.refining = false
        if (action.payload.success && action.payload.generated_code) {
          // Create new version from the refined code response
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
        } else {
          state.error = action.payload.error || 'Refinement failed'
        }
      })
      .addCase(refineCode.rejected, (state, action) => {
        state.refining = false
        state.error = action.error.message || 'Failed to refine code'
        console.error('Code refinement failed:', action.error)
      })
  }
})

export const { resetCodeGeneration, setCurrentVersion, clearError } =
  codeGenerationSlice.actions

export default codeGenerationSlice.reducer
