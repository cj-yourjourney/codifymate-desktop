// src/shared/api/config.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export const API_ENDPOINTS = {
  GENERATE_CODE: `${API_BASE_URL}/api/prompt/generate-code/`,
  REFINE_CODE: `${API_BASE_URL}/api/prompt/refine-code/`,
  REGISTER_USER: `${API_BASE_URL}/api/users/register/`,
  SIGNIN_USER: `${API_BASE_URL}/api/users/token/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/users/token/refresh/`,
  USER_DETAIL: `${API_BASE_URL}/api/users/detail/`
  // Add other endpoints as needed
} as const

// Define which endpoints don't require authentication
const PUBLIC_ENDPOINTS = [
  API_ENDPOINTS.REGISTER_USER,
  API_ENDPOINTS.SIGNIN_USER,
  API_ENDPOINTS.REFRESH_TOKEN
] as const

// User detail response type
export interface UserDetailResponse {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
  last_login: string
}

// Token response interface
export interface TokenResponse {
  access: string
  refresh: string
}

// Enhanced request options interface
export interface ApiRequestOptions extends RequestInit {
  _isRetry?: boolean // Internal flag to prevent infinite retry loops
}

// Helper function to get tokens from Electron storage
const getToken = async (
  tokenType: 'access_token' | 'refresh_token'
): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getToken(tokenType)
    }
    return null
  } catch (error) {
    console.error(`Failed to get ${tokenType}:`, error)
    return null
  }
}

// Helper function to store token
const storeToken = async (
  tokenType: 'access_token' | 'refresh_token',
  token: string
): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.storeToken(tokenType, token)
    }
  } catch (error) {
    console.error(`Failed to store ${tokenType}:`, error)
    throw error
  }
}

// Helper function to check if endpoint requires authentication
const requiresAuth = (url: string): boolean => {
  return !PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

// Global logout handler - can be overridden by setting this function
let globalLogoutHandler: (() => void) | null = null

export const setGlobalLogoutHandler = (handler: () => void) => {
  globalLogoutHandler = handler
}

// Perform logout actions
const performLogout = async (): Promise<void> => {
  try {
    // Clear all tokens
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.clearAllTokens()
    }

    // Call global logout handler if set
    if (globalLogoutHandler) {
      globalLogoutHandler()
    }

    console.log('User logged out due to authentication failure')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

// Refresh access token using refresh token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getToken('refresh_token')

    if (!refreshToken) {
      console.log('No refresh token available')
      await performLogout()
      return null
    }

    console.log('Attempting to refresh access token...')

    const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    })

    if (!response.ok) {
      console.log('Refresh token is invalid or expired')
      await performLogout()
      return null
    }

    const data: { access: string } = await response.json()

    // Store the new access token
    await storeToken('access_token', data.access)

    console.log('Access token refreshed successfully')
    return data.access
  } catch (error) {
    console.error('Error refreshing token:', error)
    await performLogout()
    return null
  }
}

// REQUEST INTERCEPTOR: Attach access token to requests
const applyRequestInterceptor = async (
  url: string,
  options: ApiRequestOptions
): Promise<[string, ApiRequestOptions]> => {
  const needsAuth = requiresAuth(url)

  // Always set Content-Type for requests with body, regardless of auth requirement
  const hasBody = options.body !== undefined

  const enhancedHeaders: Record<string, string> = {
    ...(options.headers as Record<string, string>)
  }

  // Set Content-Type for requests with body
  if (hasBody && !enhancedHeaders['Content-Type']) {
    enhancedHeaders['Content-Type'] = 'application/json'
  }

  // Add authorization for protected endpoints
  if (needsAuth) {
    const token = await getToken('access_token')
    if (token) {
      enhancedHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const enhancedOptions: ApiRequestOptions = {
    ...options,
    headers: enhancedHeaders
  }

  return [url, enhancedOptions]
}

// RESPONSE INTERCEPTOR: Handle 401 errors and token refresh
const applyResponseInterceptor = async (
  response: Response,
  originalUrl: string,
  originalOptions: ApiRequestOptions
): Promise<Response> => {
  // If response is OK or this is a retry attempt, return as is
  if (response.ok || originalOptions._isRetry) {
    return response
  }

  // Handle 401 Unauthorized errors
  if (response.status === 401 && requiresAuth(originalUrl)) {
    console.log('Received 401, attempting token refresh...')

    // Try to refresh the access token
    const newAccessToken = await refreshAccessToken()

    if (newAccessToken) {
      // Retry the original request with the new token
      console.log('Retrying original request with new token...')

      const retryOptions: ApiRequestOptions = {
        ...originalOptions,
        _isRetry: true, // Prevent infinite retry loops
        headers: {
          ...originalOptions.headers,
          Authorization: `Bearer ${newAccessToken}`
        }
      }

      const retryResponse = await fetch(originalUrl, retryOptions)
      return retryResponse
    }

    // If we couldn't refresh the token, the user will be logged out
    // by the refreshAccessToken function, so we can return the original response
  }

  return response
}

// Enhanced fetch wrapper with interceptors
export const apiRequest = async (
  url: string,
  options: ApiRequestOptions = {}
) => {
  try {
    // Apply request interceptor
    const [interceptedUrl, interceptedOptions] = await applyRequestInterceptor(
      url,
      options
    )

    // Make the initial request
    const response = await fetch(interceptedUrl, interceptedOptions)

    // Apply response interceptor
    const finalResponse = await applyResponseInterceptor(
      response,
      url,
      interceptedOptions
    )

    // Handle final response
    if (!finalResponse.ok) {
      let errorData: any = {}

      try {
        errorData = await finalResponse.json()
      } catch {
        errorData = {
          error:
            finalResponse.statusText ||
            `HTTP error! status: ${finalResponse.status}`
        }
      }

      // Mark authentication errors
      if (finalResponse.status === 401) {
        errorData.isAuthError = true
        errorData.message = 'Authentication failed. Please login again.'
      }

      throw errorData
    }

    const data = await finalResponse.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Specific API methods for different endpoints
export const apiClient = {
  // User authentication endpoints (no auth required)
  register: (userData: any) =>
    apiRequest(API_ENDPOINTS.REGISTER_USER, {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  signin: async (credentials: any): Promise<TokenResponse> => {
    const response = await apiRequest(API_ENDPOINTS.SIGNIN_USER, {
      method: 'POST',
      body: JSON.stringify(credentials)
    })

    // Note: Token storage is handled by the Redux slice, not here
    // This prevents duplicate storage calls
    return response
  },

  refreshToken: (refreshToken: string) =>
    apiRequest(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken })
    }),

  // Protected endpoints (require auth)
  getUserDetail: (): Promise<UserDetailResponse> =>
    apiRequest(API_ENDPOINTS.USER_DETAIL, {
      method: 'GET'
    }),

  generateCode: (promptData: any) =>
    apiRequest(API_ENDPOINTS.GENERATE_CODE, {
      method: 'POST',
      body: JSON.stringify(promptData)
    }),

  refineCode: (refineData: any) =>
    apiRequest(API_ENDPOINTS.REFINE_CODE, {
      method: 'POST',
      body: JSON.stringify(refineData)
    })
}

// CSRF token helper (if needed for Django)
export const getCsrfToken = (): string => {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content')
  return token || ''
}

// Token management utilities
export const tokenUtils = {
  // Check if access token is valid
  isTokenValid: async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.isTokenValid('access_token')
      }
      return false
    } catch (error) {
      console.error('Failed to check token validity:', error)
      return false
    }
  },

  // Store tokens (usually called after signin)
  storeTokens: async (
    accessToken: string,
    refreshToken: string
  ): Promise<void> => {
    try {
      await storeToken('access_token', accessToken)
      await storeToken('refresh_token', refreshToken)
    } catch (error) {
      console.error('Failed to store tokens:', error)
      throw error
    }
  },

  // Remove specific token
  removeToken: async (
    tokenType: 'access_token' | 'refresh_token'
  ): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.removeToken(tokenType)
      }
    } catch (error) {
      console.error(`Failed to remove ${tokenType}:`, error)
    }
  },

  // Clear all tokens
  clearAllTokens: async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.clearAllTokens()
      }
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  },

  // Manual token refresh (useful for proactive refresh)
  refreshTokenManually: async (): Promise<boolean> => {
    const newToken = await refreshAccessToken()
    return newToken !== null
  }
}
