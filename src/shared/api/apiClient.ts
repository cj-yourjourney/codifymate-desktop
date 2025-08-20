// src/utils/apiClient.ts
interface UserDetailResponse {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
  last_login: string
}

class ApiClient {
  private baseUrl = 'http://127.0.0.1:8000/api'

  private async getAccessToken(): Promise<string | null> {
    try {
      return await window.electronAPI.getToken('access_token')
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken()

    if (!token) {
      throw new Error('No access token available')
    }

    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be expired or invalid
        await window.electronAPI.removeToken('access_token')
        throw new Error('Authentication failed. Please login again.')
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getUserDetail(): Promise<UserDetailResponse> {
    return this.makeRequest<UserDetailResponse>('/users/detail/')
  }
}

export const apiClient = new ApiClient()
export type { UserDetailResponse }
