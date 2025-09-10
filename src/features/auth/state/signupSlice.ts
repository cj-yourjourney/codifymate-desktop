// store/slices/signupSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@/shared/api/config'

// Types
export interface User {
  id: number
  username: string
  email: string
}

export interface RegisterUserData {
  username: string
  email: string
  password: string
  password2: string
  invite_code: string
}

export interface RegisterResponse {
  user: User
  refresh: string
  access: string
}

export interface SignupError {
  [key: string]: string[] | string | undefined
  message?: string
  error?: string
}

export interface SignupState {
  user: User | null
  isLoading: boolean
  error: SignupError | null
  isRegistered: boolean
}

// Async thunk for user registration
export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterUserData,
  { rejectValue: SignupError }
>('signup/registerUser', async (userData, { rejectWithValue }) => {
  try {
    // Use the centralized apiClient instead of direct apiRequest
    const data = await apiClient.register(userData)

    // Store tokens securely after successful registration using Electron storage
    if (data.access && data.refresh) {
      try {
        await window.electronAPI.storeToken('access_token', data.access)
        await window.electronAPI.storeToken('refresh_token', data.refresh)

      } catch (storageError) {
        console.warn('Failed to store tokens after registration:', storageError)
        // Don't fail the registration if token storage fails
      }
    }

    return data
  } catch (error: unknown) {
    let formattedError: SignupError = {}

    if (typeof error === 'object' && error !== null && 'message' in error) {
      formattedError.message = (error as { message: string }).message
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error
    ) {
      formattedError.message = (error as { error: string }).error
    } else if (typeof error === 'object' && error !== null) {
      formattedError = error as SignupError
    } else {
      formattedError.message = 'Registration failed. Please try again.'
    }

    return rejectWithValue(formattedError)
  }
})

const initialState: SignupState = {
  user: null,
  isLoading: false,
  error: null,
  isRegistered: false
}

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    clearSignupError: (state) => {
      state.error = null
    },
    clearSignupState: (state) => {
      state.isRegistered = false
      state.error = null
    },
    resetSignupForm: (state) => {
      state.user = null
      state.isRegistered = false
      state.error = null
      // Tokens are now handled by Electron secure storage, not Redux
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<RegisterResponse>) => {
          state.isLoading = false
          state.user = action.payload.user
          state.isRegistered = true
          state.error = null
          // Tokens are now stored securely via Electron storage
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || { message: 'Registration failed' }
        state.isRegistered = false
      })
  }
})

export const { clearSignupError, clearSignupState, resetSignupForm } =
  signupSlice.actions
export default signupSlice.reducer
// export type {
//   SignupState,
//   User,
//   RegisterUserData,
//   RegisterResponse,
//   SignupError
// }
