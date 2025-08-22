// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  apiClient,
  tokenUtils,
  UserDetailResponse,
  setGlobalLogoutHandler
} from '@/shared/api/config'

interface AuthContextType {
  user: UserDetailResponse | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if token exists and is valid
      const isTokenValid = await tokenUtils.isTokenValid()

      if (!isTokenValid) {
        setUser(null)
        return
      }

      const userData = await apiClient.getUserDetail()
      setUser(userData)
    } catch (err) {
      console.error('Failed to fetch user:', err)

      // Handle authentication errors specifically
      if (err && typeof err === 'object' && 'isAuthError' in err) {
        setError('Authentication failed. Please login again.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
      }

      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const logout = async () => {
    try {
      // Clear tokens from storage
      await tokenUtils.clearAllTokens()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  }

  useEffect(() => {
    // Set up the global logout handler
    setGlobalLogoutHandler(() => {
      setUser(null)
      setError('Session expired. Please login again.')
    })

    fetchUser()
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    error,
    refreshUser,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
