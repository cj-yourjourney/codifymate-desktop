// src/shared/api/config.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export const API_ENDPOINTS = {
  GENERATE_CODE: `${API_BASE_URL}/api/prompt/generate-code/`,
  REFINE_CODE: `${API_BASE_URL}/api/prompt/refine-code/`,
  REGISTER_USER: `${API_BASE_URL}/api/users/register/`
  // Add other endpoints as needed
} as const

// Common fetch wrapper with error handling
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders
    })

    // Handle different HTTP status codes
    if (!response.ok) {
      let errorData: any = {}

      try {
        errorData = await response.json()
      } catch {
        // If can't parse JSON, create error object with status text
        errorData = {
          error: response.statusText || `HTTP error! status: ${response.status}`
        }
      }

      // Throw the parsed error data so it can be caught by Redux
      throw errorData
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// CSRF token helper (if needed for Django)
export const getCsrfToken = (): string => {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content')
  return token || ''
}
