// store/slices/signupSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { API_ENDPOINTS, apiRequest } from '@/shared/api/config'
import { tokenStorage } from '@/shared/utils/tokenStorage'


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
  [key: string]: string[] | string
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
    const data = await apiRequest(API_ENDPOINTS.REGISTER_USER, {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    // Store tokens securely after successful registration
    if (data.access && data.refresh) {
      await tokenStorage.storeTokens(data.access, data.refresh)
    }

    return data
  } catch (error: any) {
    return rejectWithValue(error)
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
      // Tokens are now handled by secure storage, not Redux
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
          // Tokens are now stored securely via tokenStorage
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
export type {
  SignupState,
  User,
  RegisterUserData,
  RegisterResponse,
  SignupError
}
