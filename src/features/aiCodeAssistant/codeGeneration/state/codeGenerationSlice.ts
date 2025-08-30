import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiRequest, API_ENDPOINTS } from '@/shared/api/config'

// Types for the API request and response
export interface CodeGenerationRequest {
  user_prompt: string | null
  relevant_files: Array<{
    file_path: string
    content: string
  }>
  project_structure: {
    directories: {
      [path: string]: {
        directories?: {
          [name: string]: any
        }
        files?: string[]
      }
    }
  }
}

export interface GeneratedFile {
  file_path: string
  change_type: string
  code: string
  description?: string
}

export interface GeneratedCode {
  explanation: string
  files_to_modify: GeneratedFile[]
  additional_notes?: string
}

export interface CodeGenerationResponse {
  success: boolean
  generated_code: GeneratedCode
  credits_used: string
  remaining_credits: string
  token_usage: number
  model_used: string
  debug_info: {
    workflow_success: boolean
    files_processed: number
    files_modified: number
    explanation_length: number
  }
}

// Version interface to store multiple generations
export interface CodeVersion {
  id: string
  version: string
  versionNumber: number // Add version number for easier sorting
  timestamp: string
  refinement_prompt?: string
  generated_code: GeneratedCode
  credits_used: string
  remaining_credits: string
  token_usage: number
  model_used: string
}

export interface CodeGenerationState {
  versions: CodeVersion[]
  currentVersionId: string | null
  isGenerating: boolean
  isRefining: boolean
  error: string | null
}

const initialState: CodeGenerationState = {
  versions: [],
  currentVersionId: null,
  isGenerating: false,
  isRefining: false,
  error: null
}

// Async thunk for generating code
export const generateCode = createAsyncThunk(
  'codeGeneration/generate',
  async (requestData: CodeGenerationRequest, { rejectWithValue }) => {
    try {
      // Log the full request payload
      console.log('📦 Full Request Payload:', requestData)

      const response = await apiRequest(API_ENDPOINTS.GENERATE_CODE, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })

      return response as CodeGenerationResponse
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Code generation failed'
      )
    }
  }
)

// Request interface for code refinement
export interface CodeRefinementRequest {
  current_version: {
    id: string
    version: string
    explanation: string
    files_to_modify: GeneratedFile[]
    additional_notes?: string
  }
  refinement_feedback: string
  project_structure: {
    directories: {
      [path: string]: {
        directories?: {
          [name: string]: any
        }
        files?: string[]
      }
    }
  }
}

// Async thunk for refining code
export const refineCode = createAsyncThunk(
  'codeGeneration/refine',
  async (requestData: CodeRefinementRequest, { rejectWithValue }) => {
    try {
      // Log the full refinement payload
      console.log('📦 Full Refinement Payload:', requestData)

      const response = await apiRequest(API_ENDPOINTS.REFINE_CODE, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })

      return {
        ...response,
        refinement_prompt: requestData.refinement_feedback
      } as CodeGenerationResponse & { refinement_prompt: string }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Code refinement failed'
      )
    }
  }
)

const codeGenerationSlice = createSlice({
  name: 'codeGeneration',
  initialState,
  reducers: {
    setCurrentVersion: (state, action: PayloadAction<string>) => {
      state.currentVersionId = action.payload
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    resetState: (state) => {
      return initialState
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate code cases
      .addCase(generateCode.pending, (state) => {
        state.isGenerating = true
        state.error = null
      })
      .addCase(
        generateCode.fulfilled,
        (state, action: PayloadAction<CodeGenerationResponse>) => {
          const nextVersionNumber = state.versions.length + 1
          const newVersion: CodeVersion = {
            id: `v${nextVersionNumber}`,
            version: `Version ${nextVersionNumber}`,
            versionNumber: nextVersionNumber,
            timestamp: new Date().toISOString(),
            generated_code: action.payload.generated_code,
            credits_used: action.payload.credits_used,
            remaining_credits: action.payload.remaining_credits,
            token_usage: action.payload.token_usage,
            model_used: action.payload.model_used
          }

          console.log('✅ Code Generation State: FULFILLED', {
            success: action.payload.success,
            newVersionId: newVersion.id,
            creditsUsed: action.payload.credits_used,
            remainingCredits: action.payload.remaining_credits,
            tokenUsage: action.payload.token_usage,
            modelUsed: action.payload.model_used,
            filesToModifyCount:
              action.payload.generated_code?.files_to_modify?.length || 0,
            explanationLength:
              action.payload.generated_code?.explanation?.length || 0,
            totalVersions: state.versions.length + 1
          })

          state.isGenerating = false
          state.error = null
          state.versions.push(newVersion)
          state.currentVersionId = newVersion.id
        }
      )
      .addCase(generateCode.rejected, (state, action) => {
        state.isGenerating = false
        state.error = (action.payload as string) || 'Code generation failed'
      })
      // Refine code cases
      .addCase(refineCode.pending, (state) => {
        state.isRefining = true
        state.error = null
      })
      .addCase(
        refineCode.fulfilled,
        (
          state,
          action: PayloadAction<
            CodeGenerationResponse & { refinement_prompt: string }
          >
        ) => {
          const nextVersionNumber = state.versions.length + 1
          const newVersion: CodeVersion = {
            id: `v${nextVersionNumber}`,
            version: `Version ${nextVersionNumber}`,
            versionNumber: nextVersionNumber,
            timestamp: new Date().toISOString(),
            refinement_prompt: action.payload.refinement_prompt,
            generated_code: action.payload.generated_code,
            credits_used: action.payload.credits_used,
            remaining_credits: action.payload.remaining_credits,
            token_usage: action.payload.token_usage,
            model_used: action.payload.model_used
          }

          console.log('✅ Code Refinement State: FULFILLED', {
            success: action.payload.success,
            newVersionId: newVersion.id,
            refinementPrompt: action.payload.refinement_prompt,
            creditsUsed: action.payload.credits_used,
            remainingCredits: action.payload.remaining_credits,
            tokenUsage: action.payload.token_usage,
            modelUsed: action.payload.model_used,
            filesToModifyCount:
              action.payload.generated_code?.files_to_modify?.length || 0,
            explanationLength:
              action.payload.generated_code?.explanation?.length || 0,
            totalVersions: state.versions.length + 1
          })

          state.isRefining = false
          state.error = null
          state.versions.push(newVersion)
          state.currentVersionId = newVersion.id
        }
      )
      .addCase(refineCode.rejected, (state, action) => {
        state.isRefining = false
        state.error = (action.payload as string) || 'Code refinement failed'
      })
  }
})

export const { setCurrentVersion, clearError, resetState } =
  codeGenerationSlice.actions

export default codeGenerationSlice.reducer
