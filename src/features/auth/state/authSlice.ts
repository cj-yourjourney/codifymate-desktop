// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
interface AuthTokens {
  access: string
  refresh: string
}

interface SignInCredentials {
  username: string
  password: string
}

interface AuthError {
  message?: string
  error?: string
  username?: string | string[]
  password?: string | string[]
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
  tokens: AuthTokens | null
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: null
}

// Async thunks
export const signIn = createAsyncThunk<
  AuthTokens,
  SignInCredentials,
  { rejectValue: AuthError }
>('auth/signIn', async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/users/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const errorData = await response.json()
      return rejectWithValue(errorData)
    }

    const tokens: AuthTokens = await response.json()

    // Store tokens in Electron secure storage
    try {
      await window.electronAPI.storeToken('access_token', tokens.access)
      await window.electronAPI.storeToken('refresh_token', tokens.refresh)
    } catch (storageError) {
      console.warn('Failed to store tokens in secure storage:', storageError)
      // Continue with the login process even if storage fails
    }

    return tokens
  } catch (error) {
    return rejectWithValue({
      message: 'Network error. Please check your connection and try again.'
    })
  }
})

export const loadStoredTokens = createAsyncThunk<
  AuthTokens | null,
  void,
  { rejectValue: string }
>('auth/loadStoredTokens', async (_, { rejectWithValue }) => {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      window.electronAPI.getToken('access_token'),
      window.electronAPI.getToken('refresh_token')
    ])

    if (accessToken && refreshToken) {
      return {
        access: accessToken,
        refresh: refreshToken
      }
    }

    return null
  } catch (error) {
    return rejectWithValue('Failed to load stored tokens')
  }
})

export const signOut = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      // Clear tokens from secure storage
      await Promise.all([
        window.electronAPI.removeToken('access_token'),
        window.electronAPI.removeToken('refresh_token')
      ])
    } catch (error) {
      return rejectWithValue('Failed to clear stored tokens')
    }
  }
)

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearFieldError: (
      state,
      action: PayloadAction<'username' | 'password'>
    ) => {
      if (state.error) {
        const field = action.payload
        const newError = { ...state.error }
        delete newError[field]
        state.error = Object.keys(newError).length > 0 ? newError : null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Sign in cases
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.tokens = action.payload
        state.error = null
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.tokens = null
        state.error = action.payload || { message: 'Sign in failed' }
      })

      // Load stored tokens cases
      .addCase(loadStoredTokens.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadStoredTokens.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.isAuthenticated = true
          state.tokens = action.payload
        }
      })
      .addCase(loadStoredTokens.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.tokens = null
      })

      // Sign out cases
      .addCase(signOut.pending, (state) => {
        state.isLoading = true
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.tokens = null
        state.error = null
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false
        // Still clear the state even if token removal failed
        state.isAuthenticated = false
        state.tokens = null
        state.error = { message: action.payload || 'Sign out failed' }
      })
  }
})

export const { clearError, clearFieldError } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens
