import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiRequest, API_ENDPOINTS } from '@/shared/api/config'

// Types for the API request and response
export interface RelevantFilesRequest {
  user_prompts: string | null 
  project_file_paths: string[]
}

// Define project structure interface
export interface ProjectStructure {
  directories: {
    [path: string]: {
      directories?: {
        [name: string]: ProjectStructure['directories'][string]
      }
      files?: string[]
    }
  }
}

export interface RelevantFilesResponse {
  credit_usage: number
  relevant_file_paths: string[]
  project_structure: ProjectStructure
  tokens_used: number
  remaining_credits: number
}

// New interface for selected files with content
export interface SelectedFile {
  file_path: string
  content: string
}

export interface RelevantFilesState {
  projectPath: string | null
  projectFiles: string[]
  aiRecommendedFiles: string[] // AI suggested relevant files (file paths only)
  relevantFiles: SelectedFile[] // User selected files with content
  projectStructure: ProjectStructure | null // Project structure from analysis
  creditUsage: number | null
  remainingCredits: number | null
  isLoading: boolean
  isAnalyzing: boolean
  error: string | null
}

const initialState: RelevantFilesState = {
  projectPath: null,
  projectFiles: [],
  aiRecommendedFiles: [],
  relevantFiles: [],
  projectStructure: null,
  creditUsage: null,
  remainingCredits: null,
  isLoading: false,
  isAnalyzing: false,
  error: null
}

// Async thunk for analyzing relevant files
export const analyzeRelevantFiles = createAsyncThunk(
  'relevantFiles/analyze',
  async (requestData: RelevantFilesRequest, { rejectWithValue }) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.RELEVANT_FILES_ANALYZE, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })

      return response as RelevantFilesResponse
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Analysis failed'
      )
    }
  }
)

const relevantFilesSlice = createSlice({
  name: 'relevantFiles',
  initialState,
  reducers: {
    setProjectPath: (state, action: PayloadAction<string>) => {
      state.projectPath = action.payload
      state.error = null
    },
    setProjectFiles: (state, action: PayloadAction<string[]>) => {
      state.projectFiles = action.payload
      state.error = null
    },
    addSelectedFile: (state, action: PayloadAction<SelectedFile>) => {
      // Check if file is already selected
      const exists = state.relevantFiles.some(
        (file) => file.file_path === action.payload.file_path
      )
      if (!exists) {
        state.relevantFiles.push(action.payload)
      }
    },
    removeSelectedFile: (state, action: PayloadAction<string>) => {
      state.relevantFiles = state.relevantFiles.filter(
        (file) => file.file_path !== action.payload
      )
    },
    clearSelectedFiles: (state) => {
      state.relevantFiles = []
    },
    clearRelevantFiles: (state) => {
      state.aiRecommendedFiles = []
      state.relevantFiles = []
      state.projectStructure = null
      state.creditUsage = null
      state.remainingCredits = null
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
      .addCase(analyzeRelevantFiles.pending, (state) => {
        state.isAnalyzing = true
        state.error = null
      })
      .addCase(
        analyzeRelevantFiles.fulfilled,
        (state, action: PayloadAction<RelevantFilesResponse>) => {
          state.isAnalyzing = false
          state.error = null
          state.aiRecommendedFiles = action.payload.relevant_file_paths
          state.projectStructure = action.payload.project_structure
          state.creditUsage = action.payload.credit_usage
          state.remainingCredits = action.payload.remaining_credits
        }
      )
      .addCase(analyzeRelevantFiles.rejected, (state, action) => {
        state.isAnalyzing = false
        state.error = (action.payload as string) || 'Analysis failed'
        state.aiRecommendedFiles = []
        state.projectStructure = null
        state.creditUsage = null
        state.remainingCredits = null
      })
  }
})

export const {
  setProjectPath,
  setProjectFiles,
  addSelectedFile,
  removeSelectedFile,
  clearSelectedFiles,
  clearRelevantFiles,
  clearError,
  resetState
} = relevantFilesSlice.actions
export default relevantFilesSlice.reducer
