import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface PromptRefinementState {
  userPrompt: string
  selectedFolder: string
  projectFilePaths: string[]
  loading: boolean
  error: string | null
}

const initialState: PromptRefinementState = {
  userPrompt: '',
  selectedFolder: '',
  projectFilePaths: [],
  loading: false,
  error: null
}

// Async thunk to get project files from Electron
export const getProjectFiles = createAsyncThunk(
  'promptRefinement/getProjectFiles',
  async (folderPath: string) => {
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
    resetState: () => initialState
  },
  extraReducers: (builder) => {
    builder
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
  }
})

export const { setUserPrompt, setSelectedFolder, clearError, resetState } =
  promptRefinementSlice.actions
export default promptRefinementSlice.reducer
