import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

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

interface PromptClarificationState {
  clarifyingQuestions: string[]
  relevantFiles: string[]
  projectStructure: ProjectStructure | null
  workflowMessages: WorkflowMessage[]
  loading: boolean
  error: string | null
}

const initialState: PromptClarificationState = {
  clarifyingQuestions: [],
  relevantFiles: [],
  projectStructure: null,
  workflowMessages: [],
  loading: false,
  error: null
}

// Async thunk to call the refine prompt API
export const refinePrompt = createAsyncThunk(
  'promptClarification/refinePrompt',
  async (payload: { user_prompts: string; project_file_paths: string[] }) => {
    const response = await fetch(
      'http://127.0.0.1:8000/api/prompt/refine-prompt/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

const promptClarificationSlice = createSlice({
  name: 'promptClarification',
  initialState,
  reducers: {
    resetClarificationState: () => initialState
  },
  extraReducers: (builder) => {
    builder
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

export const { resetClarificationState } = promptClarificationSlice.actions
export default promptClarificationSlice.reducer
