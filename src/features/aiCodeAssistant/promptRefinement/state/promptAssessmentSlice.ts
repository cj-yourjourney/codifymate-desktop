// src/store/slices/promptAssessmentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiRequest, API_ENDPOINTS } from '@/shared/api/config'

// Types based on your API response
export interface PromptAssessmentRequest {
  user_prompt: string
}

export interface PromptAssessmentResponse {
  category: string
  prompt_score: string // e.g., "2/10" or "8/10"
  total_credit_usage: number
  questions?: string[] // Present when score < 7
  strengths?: string[] // Present when score >= 7
}

// Normalized assessment state
export interface AssessmentState {
  score: number
  type: 'improvement' | 'excellent'
  content: {
    title: string
    items: string[]
  }
  category: string
  creditUsage: number
}

export interface PromptAssessmentState {
  assessment: AssessmentState | null
  isLoading: boolean
  error: string | null
  user_prompt: string | null // Store the current user prompt
}

const initialState: PromptAssessmentState = {
  assessment: null,
  isLoading: false,
  error: null,
  user_prompt: null // Initialize as null
}

// Async thunk for assessing prompt
export const assessPrompt = createAsyncThunk(
  'promptAssessment/assess',
  async (requestData: PromptAssessmentRequest, { rejectWithValue }) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.PROMPT_ASSESSMENT, {
        method: 'POST',
        body: JSON.stringify(requestData)
      })

      return response as PromptAssessmentResponse
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Assessment failed'
      )
    }
  }
)

// Helper function to normalize API response to match component interface
const normalizeAssessmentResponse = (
  response: PromptAssessmentResponse
): AssessmentState => {
  // Extract score number from string like "2/10" or "8/10"
  const scoreMatch = response.prompt_score.match(/(\d+)\/10/)
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0

  const isExcellent = score >= 7
  const items = isExcellent
    ? response.strengths || []
    : response.questions || []

  return {
    score,
    type: isExcellent ? 'excellent' : 'improvement',
    content: {
      title: isExcellent
        ? "Excellent prompt! Here's why:"
        : 'Your prompt needs more detail',
      items
    },
    category: response.category,
    creditUsage: response.total_credit_usage
  }
}

const promptAssessmentSlice = createSlice({
  name: 'promptAssessment',
  initialState,
  reducers: {
    clearAssessment: (state) => {
      state.assessment = null
      state.error = null
      state.user_prompt = null // Clear user_prompt when clearing assessment
    },
    clearError: (state) => {
      state.error = null
    },
    // New action to update user_prompt independently
    setUserPrompt: (state, action: PayloadAction<string>) => {
      state.user_prompt = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(assessPrompt.pending, (state, action) => {
        state.isLoading = true
        state.error = null
        state.user_prompt = action.meta.arg.user_prompt // Store the user prompt
      })
      .addCase(
        assessPrompt.fulfilled,
        (state, action: PayloadAction<PromptAssessmentResponse>) => {
          state.isLoading = false
          state.error = null
          state.assessment = normalizeAssessmentResponse(action.payload)
          // user_prompt is already set in pending case
        }
      )
      .addCase(assessPrompt.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Assessment failed'
        state.assessment = null
        // Keep user_prompt even if assessment fails
      })
  }
})

export const { clearAssessment, clearError, setUserPrompt } =
  promptAssessmentSlice.actions
export default promptAssessmentSlice.reducer
