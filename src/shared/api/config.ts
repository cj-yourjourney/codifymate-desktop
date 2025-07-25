// src/shared/api/config.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

export const API_ENDPOINTS = {
  GENERATE_CODE: `${API_BASE_URL}/api/prompt/generate-code/`,
  REFINE_CODE: `${API_BASE_URL}/api/prompt/refine-code/`
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
      let errorMessage = `HTTP error! status: ${response.status}`

      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage
      }

      throw new Error(errorMessage)
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
