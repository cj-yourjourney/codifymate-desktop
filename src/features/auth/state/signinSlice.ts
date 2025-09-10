// store/slices/signinSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@/shared/api/config'

// Types
interface AuthTokens {
  access: string
  refresh: string
}

interface SignInCredentials {
  username: string
  password: string
}

interface SignInError {
  message?: string
  error?: string
  detail?: string // For TokenObtainPairView errors
  username?: string | string[]
  password?: string | string[]
  non_field_errors?: string | string[] // Common DRF error field
}

interface SignInState {
  isAuthenticated: boolean
  isLoading: boolean
  error: SignInError | null
}

// Initial state
const initialState: SignInState = {
  isAuthenticated: false,
  isLoading: false,
  error: null
}

// Async thunks
export const signIn = createAsyncThunk<
  void, // Changed from AuthTokens to void since we're not storing tokens in Redux
  SignInCredentials,
  { rejectValue: SignInError }
>('signin/signIn', async (credentials, { rejectWithValue }) => {
  try {
    // Use the centralized apiClient instead of direct apiRequest
    const tokens: AuthTokens = await apiClient.signin(credentials)

    // Store tokens in Electron secure storage
    try {
      await window.electronAPI.storeToken('access_token', tokens.access)
      await window.electronAPI.storeToken('refresh_token', tokens.refresh)

      // Console.log tokens for testing using getToken method
      const storedAccessToken = await window.electronAPI.getToken(
        'access_token'
      )
      const storedRefreshToken = await window.electronAPI.getToken(
        'refresh_token'
      )

      console.log('=== Tokens stored successfully ===')
      console.log('Access Token:', storedAccessToken)
      console.log('Refresh Token:', storedRefreshToken)
      console.log('================================')
    } catch (storageError) {
      console.warn('Failed to store tokens in secure storage:', storageError)
      throw storageError // Reject the action if storage fails
    }

    // Don't return tokens since we're not storing them in Redux
    return
  } catch (error: unknown) {
    let formattedError: SignInError = {}

    if (typeof error === 'object' && error !== null && 'detail' in error) {
      formattedError.message = (error as { detail: string }).detail
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'non_field_errors' in error
    ) {
      const nonFieldErrors = Array.isArray(
        (error as { non_field_errors: string[] }).non_field_errors
      )
        ? (error as { non_field_errors: string[] }).non_field_errors[0]
        : (error as { non_field_errors: string }).non_field_errors
      formattedError.message = nonFieldErrors
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error
    ) {
      formattedError.message = (error as { error: string }).error
    } else if (typeof error === 'object' && error !== null) {
      formattedError = error as SignInError
    } else {
      formattedError.message =
        'Network error. Please check your connection and try again.'
    }

    return rejectWithValue(formattedError)
  }
})

export const checkStoredTokens = createAsyncThunk<
  boolean, // Returns whether valid tokens exist
  void,
  { rejectValue: string }
>('signin/checkStoredTokens', async (_, { rejectWithValue }) => {
  try {
    const [accessTokenExists, refreshTokenExists] = await Promise.all([
      window.electronAPI.isTokenValid('access_token'),
      window.electronAPI.isTokenValid('refresh_token')
    ])

    return accessTokenExists && refreshTokenExists
  } catch (error) {
    console.log(error)
    return rejectWithValue('Failed to check stored tokens')
  }
})

export const signOut = createAsyncThunk<void, void, { rejectValue: string }>(
  'signin/signOut',
  async (_, { rejectWithValue }) => {
    try {
      // Clear tokens from secure storage
      await Promise.all([
        window.electronAPI.removeToken('access_token'),
        window.electronAPI.removeToken('refresh_token')
      ])

      console.log('=== Tokens cleared successfully ===')
    } catch (error) {
      console.log(error)
      return rejectWithValue('Failed to clear stored tokens')
    }
  }
)

// Slice
const signinSlice = createSlice({
  name: 'signin',
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
    },
    // ADD THIS RESETAUTH ACTION HERE
    resetAuth: (state) => {
      state.isAuthenticated = false
      state.error = null
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Sign in cases
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.error = action.payload || { message: 'Sign in failed' }
      })

      // Check stored tokens cases
      .addCase(checkStoredTokens.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkStoredTokens.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = action.payload // true if tokens exist and are valid
      })
      .addCase(checkStoredTokens.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
      })

      // Sign out cases
      .addCase(signOut.pending, (state) => {
        state.isLoading = true
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false
        // Still clear the state even if token removal failed
        state.isAuthenticated = false
        state.error = { message: action.payload || 'Sign out failed' }
      })
  }
})

// UPDATE THE EXPORT TO INCLUDE RESETAUTH
export const { clearError, clearFieldError, resetAuth } = signinSlice.actions
export default signinSlice.reducer

// Selectors
export const selectSignIn = (state: { signin: SignInState }) => state.signin
export const selectIsAuthenticated = (state: { signin: SignInState }) =>
  state.signin.isAuthenticated
export const selectIsLoading = (state: { signin: SignInState }) =>
  state.signin.isLoading
export const selectSignInError = (state: { signin: SignInState }) =>
  state.signin.error
