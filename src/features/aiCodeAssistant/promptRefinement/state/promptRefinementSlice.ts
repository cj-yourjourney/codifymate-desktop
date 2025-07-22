// store/slices/promptRefinementSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
interface WorkflowMessage {
  agent: string
  status: string
  error?: string
  workflow?: string
}

interface ProjectStructure {
  type: string
  root: string
  structure: {
    root_files: string[]
  }
  conventions: Record<string, any>
  framework: Record<string, any>
}

interface RefinePromptResponse {
  success: boolean
  data: {
    clarifying_questions: string[]
    relevant_files: string[]
    project_structure: ProjectStructure
    workflow_messages: WorkflowMessage[]
  }
}

interface PromptRefinementState {
  userPrompt: string
  selectedFolder: string
  projectFilePaths: string[]
  clarifyingQuestions: string[]
  relevantFiles: string[]
  projectStructure: ProjectStructure | null
  workflowMessages: WorkflowMessage[]
  loading: boolean
  error: string | null
}

const initialState: PromptRefinementState = {
  userPrompt: '',
  selectedFolder: '',
  projectFilePaths: [],
  clarifyingQuestions: [],
  relevantFiles: [],
  projectStructure: null,
  workflowMessages: [],
  loading: false,
  error: null
}

// Async thunk for refining prompt
export const refinePrompt = createAsyncThunk(
  'promptRefinement/refinePrompt',
  async (payload: { user_prompts: string; project_file_paths: string[] }) => {
    const response = await fetch(
      'http://127.0.0.1:8000/api/prompt/refine-prompt/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: RefinePromptResponse = await response.json()
    return data
  }
)

// Async thunk for getting project files via Electron
export const getProjectFiles = createAsyncThunk(
  'promptRefinement/getProjectFiles',
  async (folderPath: string) => {
    // This will call the Electron API to get all file paths in the project folder
    const filePaths = await window.electronAPI.getProjectFiles(folderPath)
    return filePaths
  }
)

const promptRefinementSlice = createSlice({
  name: 'promptRefinement',
  initialState,
  reducers: {
    setUserPrompt: (state, action: PayloadAction<string>) => {
      state.userPrompt = action.payload
    },
    setSelectedFolder: (state, action: PayloadAction<string>) => {
      state.selectedFolder = action.payload
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
      // Get project files
      .addCase(getProjectFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProjectFiles.fulfilled, (state, action) => {
        state.loading = false
        state.projectFilePaths = action.payload
      })
      .addCase(getProjectFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to get project files'
      })
      // Refine prompt
      .addCase(refinePrompt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(refinePrompt.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success) {
          state.clarifyingQuestions = action.payload.data.clarifying_questions
          state.relevantFiles = action.payload.data.relevant_files
          state.projectStructure = action.payload.data.project_structure
          state.workflowMessages = action.payload.data.workflow_messages
        }
      })
      .addCase(refinePrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to refine prompt'
      })
  }
})

export const { setUserPrompt, setSelectedFolder, clearError, resetState } =
  promptRefinementSlice.actions
export default promptRefinementSlice.reducer
