// src/utils/tokenStorage.ts
class TokenStorage {
  private isElectron(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.electronAPI !== undefined &&
      typeof window.electronAPI.storeToken === 'function'
    )
  }

  async storeAccessToken(token: string): Promise<void> {
    if (this.isElectron()) {
      try {
        await window.electronAPI.storeToken('access_token', token)
      } catch (error) {
        console.error('Failed to store access token in Electron:', error)
        // Fallback to sessionStorage
        sessionStorage.setItem('access_token', token)
      }
    } else {
      // Fallback for development in browser or when Electron API is not available
      sessionStorage.setItem('access_token', token)
    }
  }

  async storeRefreshToken(token: string): Promise<void> {
    if (this.isElectron()) {
      try {
        await window.electronAPI.storeToken('refresh_token', token)
      } catch (error) {
        console.error('Failed to store refresh token in Electron:', error)
        // Fallback to sessionStorage
        sessionStorage.setItem('refresh_token', token)
      }
    } else {
      // Fallback for development in browser or when Electron API is not available
      sessionStorage.setItem('refresh_token', token)
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (this.isElectron()) {
      try {
        return await window.electronAPI.getToken('access_token')
      } catch (error) {
        console.error('Failed to get access token from Electron:', error)
        // Fallback to sessionStorage
        return sessionStorage.getItem('access_token')
      }
    } else {
      return sessionStorage.getItem('access_token')
    }
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.isElectron()) {
      try {
        return await window.electronAPI.getToken('refresh_token')
      } catch (error) {
        console.error('Failed to get refresh token from Electron:', error)
        // Fallback to sessionStorage
        return sessionStorage.getItem('refresh_token')
      }
    } else {
      return sessionStorage.getItem('refresh_token')
    }
  }

  async removeTokens(): Promise<void> {
    if (this.isElectron()) {
      try {
        await window.electronAPI.clearAllTokens()
      } catch (error) {
        console.error('Failed to clear tokens in Electron:', error)
        // Fallback to sessionStorage
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
      }
    } else {
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
    }
  }

  async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.storeAccessToken(accessToken),
      this.storeRefreshToken(refreshToken)
    ])
  }

  // Temporary debug method - remove in production
  async debugTokens(): Promise<void> {
    const accessToken = await this.getAccessToken()
    const refreshToken = await this.getRefreshToken()
    console.log('=== TOKEN DEBUG ===')
    console.log('Access Token:', accessToken)
    console.log('Refresh Token:', refreshToken)
    console.log('==================')
  }
}

export const tokenStorage = new TokenStorage()
