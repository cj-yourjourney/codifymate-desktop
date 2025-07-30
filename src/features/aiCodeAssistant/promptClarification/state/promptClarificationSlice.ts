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

interface QuestionAnswer {
  question: string
  answer: string
}

interface FileWithContent {
  filePath: string
  content: string
}

interface PromptClarificationState {
  clarifyingQuestions: string[]
  clarifyingQuestionsWithAnswers: QuestionAnswer[]
  relevantFiles: string[]
  selectedRelevantFiles: FileWithContent[]
  manuallyAddedFiles: FileWithContent[]
  additionalNotes: string
  projectStructure: ProjectStructure | null
  workflowMessages: WorkflowMessage[]
  loading: boolean
  error: string | null
  fileLoading: boolean
}

const initialState: PromptClarificationState = {
  clarifyingQuestions: [],
  clarifyingQuestionsWithAnswers: [],
  relevantFiles: [],
  selectedRelevantFiles: [],
  manuallyAddedFiles: [],
  additionalNotes: '',
  projectStructure: null,
  workflowMessages: [],
  loading: false,
  error: null,
  fileLoading: false
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

// Async thunk to read file content
export const readFileContent = createAsyncThunk(
  'promptClarification/readFileContent',
  async (filePath: string) => {
    if (window.electronAPI?.readFileContent) {
      const content = await window.electronAPI.readFileContent(filePath)
      return { filePath, content }
    }
    throw new Error('File reading not available')
  }
)

const promptClarificationSlice = createSlice({
  name: 'promptClarification',
  initialState,
  reducers: {
    resetClarificationState: () => initialState,
    updateQuestionAnswer: (
      state,
      action: PayloadAction<{ question: string; answer: string }>
    ) => {
      const { question, answer } = action.payload

      // Find existing question-answer pair
      const existingIndex = state.clarifyingQuestionsWithAnswers.findIndex(
        (qa) => qa.question === question
      )

      if (answer.trim()) {
        // If answer is not empty, add or update the question-answer pair
        if (existingIndex !== -1) {
          state.clarifyingQuestionsWithAnswers[existingIndex].answer = answer
        } else {
          state.clarifyingQuestionsWithAnswers.push({ question, answer })
        }
      } else {
        // If answer is empty, remove the question-answer pair if it exists
        if (existingIndex !== -1) {
          state.clarifyingQuestionsWithAnswers.splice(existingIndex, 1)
        }
      }
    },
    setAdditionalNotes: (state, action: PayloadAction<string>) => {
      state.additionalNotes = action.payload
    },
    addManualFile: (state, action: PayloadAction<FileWithContent>) => {
      const existingIndex = state.manuallyAddedFiles.findIndex(
        (file) => file.filePath === action.payload.filePath
      )
      if (existingIndex === -1) {
        state.manuallyAddedFiles.push(action.payload)
      }
    },
    removeManualFile: (state, action: PayloadAction<string>) => {
      state.manuallyAddedFiles = state.manuallyAddedFiles.filter(
        (file) => file.filePath !== action.payload
      )
    },
    toggleRelevantFile: (
      state,
      action: PayloadAction<{
        filePath: string
        content?: string
        action?: 'add' | 'remove'
      }>
    ) => {
      const { filePath, content, action: actionType } = action.payload
      const existingIndex = state.selectedRelevantFiles.findIndex(
        (file) => file.filePath === filePath
      )

      if (
        actionType === 'remove' ||
        (actionType === undefined && existingIndex !== -1)
      ) {
        // Remove file if explicitly requested or if it exists and no action specified (legacy behavior)
        if (existingIndex !== -1) {
          state.selectedRelevantFiles.splice(existingIndex, 1)
        }
      } else if (
        actionType === 'add' ||
        (actionType === undefined && existingIndex === -1)
      ) {
        // Add file if explicitly requested or if it doesn't exist and no action specified (legacy behavior)
        if (existingIndex === -1 && content !== undefined) {
          state.selectedRelevantFiles.push({ filePath, content })
        }
      }
    },
    setFileLoading: (state, action: PayloadAction<boolean>) => {
      state.fileLoading = action.payload
    }
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
          // Reset question-answer pairs when new questions come in
          state.clarifyingQuestionsWithAnswers = []
          state.relevantFiles = action.payload.data.relevant_files
          // Reset selected files when new relevant files come in
          state.selectedRelevantFiles = []
          state.projectStructure = action.payload.data.project_structure
          state.workflowMessages = action.payload.data.workflow_messages
        }
      })
      .addCase(refinePrompt.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to refine prompt'
      })
      .addCase(readFileContent.pending, (state) => {
        state.fileLoading = true
      })
      .addCase(readFileContent.fulfilled, (state, action) => {
        state.fileLoading = false
        // This will be handled by the component directly
      })
      .addCase(readFileContent.rejected, (state, action) => {
        state.fileLoading = false
        state.error = action.error.message || 'Failed to read file content'
      })
  }
})

export const {
  resetClarificationState,
  updateQuestionAnswer,
  setAdditionalNotes,
  addManualFile,
  removeManualFile,
  toggleRelevantFile,
  setFileLoading
} = promptClarificationSlice.actions

export default promptClarificationSlice.reducer
