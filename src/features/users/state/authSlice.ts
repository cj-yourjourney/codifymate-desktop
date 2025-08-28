// src/shared/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiRequest, API_ENDPOINTS } from '@/shared/api/config'
import { tokenStorage } from '@/shared/utils/tokenStorage'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
  last_login: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

// Async thunks
export const signin = createAsyncThunk(
  'auth/signin',
  async ({ username, password }: { username: string; password: string }) => {
    const response = await apiRequest(API_ENDPOINTS.SIGNIN_USER, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })

    // Store tokens
    await tokenStorage.storeTokens(response.access, response.refresh)

    return response
  }
)

export const fetchUserDetail = createAsyncThunk(
  'auth/fetchUserDetail',
  async () => {
    const response = await apiRequest(API_ENDPOINTS.AUTH_DETAIL)
    return response
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
  }) => {
    const response = await apiRequest(API_ENDPOINTS.REGISTER_USER, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    return response
  }
)

// Check if user is authenticated on app load
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async () => {
    const isValid = await tokenStorage.isAccessTokenValid()
    if (isValid) {
      // Fetch user details to confirm authentication
      const response = await apiRequest(API_ENDPOINTS.AUTH_DETAIL)
      return response
    }
    throw new Error('No valid token')
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      // Clear tokens
      tokenStorage.removeTokens()
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    }
  },
  extraReducers: (builder) => {
    // Sign in
    builder
      .addCase(signin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.isLoading = false
        console.log(action)
        // Note: signin response contains tokens, user details come from fetchUserDetail
      })
      .addCase(signin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Sign in failed'
      })

    // Fetch user detail
    builder
      .addCase(fetchUserDetail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch user details'
        state.isAuthenticated = false
        state.user = null
      })

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false
        // After successful registration, user should sign in
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Registration failed'
      })

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
      })
  }
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
