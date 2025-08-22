// src/utils/tokenStorage.ts (updated with new features)
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

  // New utility methods for token management

  /**
   * Check if a token exists and is still valid (not expired)
   */
  async isAccessTokenValid(): Promise<boolean> {
    if (this.isElectron()) {
      try {
        return await window.electronAPI.isTokenValid('access_token')
      } catch (error) {
        console.error('Failed to check access token validity:', error)
        return sessionStorage.getItem('access_token') !== null
      }
    } else {
      return sessionStorage.getItem('access_token') !== null
    }
  }

  /**
   * Check if refresh token exists and is still valid (not expired)
   */
  async isRefreshTokenValid(): Promise<boolean> {
    if (this.isElectron()) {
      try {
        return await window.electronAPI.isTokenValid('refresh_token')
      } catch (error) {
        console.error('Failed to check refresh token validity:', error)
        return sessionStorage.getItem('refresh_token') !== null
      }
    } else {
      return sessionStorage.getItem('refresh_token') !== null
    }
  }

  /**
   * Extend the expiration of both tokens (useful when user is active)
   */
  async extendTokensExpiry(): Promise<boolean> {
    if (this.isElectron()) {
      try {
        const [accessResult, refreshResult] = await Promise.all([
          window.electronAPI.extendTokenExpiry('access_token'),
          window.electronAPI.extendTokenExpiry('refresh_token')
        ])
        return accessResult && refreshResult
      } catch (error) {
        console.error('Failed to extend token expiry:', error)
        return false
      }
    } else {
      // In browser mode, tokens don't have expiry, so always return true
      return true
    }
  }

  /**
   * Check if user is authenticated (has valid tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    const [hasAccessToken, hasRefreshToken] = await Promise.all([
      this.isAccessTokenValid(),
      this.isRefreshTokenValid()
    ])

    // User is authenticated if they have either a valid access token or refresh token
    return hasAccessToken || hasRefreshToken
  }

  /**
   * Get tokens info for debugging (useful during development)
   */
  async getTokensInfo(): Promise<{
    hasAccessToken: boolean
    hasRefreshToken: boolean
    accessTokenValid?: boolean
    refreshTokenValid?: boolean
  }> {
    const [hasAccessToken, hasRefreshToken] = await Promise.all([
      this.getAccessToken().then((token) => token !== null),
      this.getRefreshToken().then((token) => token !== null)
    ])

   const info: {
     hasAccessToken: boolean;
     hasRefreshToken: boolean;
     accessTokenValid?: boolean;
     refreshTokenValid?: boolean;
   } = {
     hasAccessToken,
     hasRefreshToken
   }

    if (this.isElectron()) {
      const [accessTokenValid, refreshTokenValid] = await Promise.all([
        this.isAccessTokenValid(),
        this.isRefreshTokenValid()
      ])

      info.accessTokenValid = accessTokenValid
      info.refreshTokenValid = refreshTokenValid
    }

    return info
  }

  // Enhanced debug method
  async debugTokens(): Promise<void> {
    const info = await this.getTokensInfo()
    const accessToken = await this.getAccessToken()
    const refreshToken = await this.getRefreshToken()

    console.log('=== TOKEN DEBUG ===')
    console.log('Environment:', this.isElectron() ? 'Electron' : 'Browser')
    console.log('Has Access Token:', info.hasAccessToken)
    console.log('Has Refresh Token:', info.hasRefreshToken)

    if (this.isElectron()) {
      console.log('Access Token Valid:', info.accessTokenValid)
      console.log('Refresh Token Valid:', info.refreshTokenValid)
    }

    console.log('Access Token Length:', accessToken?.length || 0)
    console.log('Refresh Token Length:', refreshToken?.length || 0)
    console.log('==================')
  }
}

export const tokenStorage = new TokenStorage()
