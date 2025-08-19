// store/slices/signupSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

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
  accessToken: string | null
  refreshToken: string | null
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
    const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      return rejectWithValue(data)
    }

    return data
  } catch (error) {
    return rejectWithValue({
      message: 'Network error. Please check your connection.'
    })
  }
})

const initialState: SignupState = {
  user: null,
  accessToken: null,
  refreshToken: null,
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
      state.accessToken = null
      state.refreshToken = null
      state.isRegistered = false
      state.error = null
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
          state.accessToken = action.payload.access
          state.refreshToken = action.payload.refresh
          state.isRegistered = true
          state.error = null
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
