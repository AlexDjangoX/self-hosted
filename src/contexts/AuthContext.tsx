'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  userId: string
  email: string
  username: string
  role: string
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load tokens from localStorage on mount
  useEffect(() => {
    const loadTokens = () => {
      try {
        const storedTokens = localStorage.getItem('authTokens')
        if (storedTokens) {
          const parsedTokens: AuthTokens = JSON.parse(storedTokens)

          // Verify token is still valid by checking expiry
          const decoded = JSON.parse(atob(parsedTokens.accessToken.split('.')[1]))
          const now = Date.now() / 1000

          if (decoded.exp > now) {
            setTokens(parsedTokens)
            setUser({
              userId: decoded.userId,
              email: decoded.email,
              username: decoded.username,
              role: decoded.role,
            })
          } else {
            // Token expired, try refresh
            refreshToken()
          }
        }
      } catch (error) {
        console.error('Error loading tokens:', error)
        localStorage.removeItem('authTokens')
      } finally {
        setIsLoading(false)
      }
    }

    loadTokens()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      const { tokens: newTokens, user: userData } = data

      setTokens(newTokens)
      setUser({
        userId: userData.userId,
        email: userData.email,
        username: userData.username,
        role: userData.role,
      })

      // Store tokens in localStorage
      localStorage.setItem('authTokens', JSON.stringify(newTokens))
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      const data = await response.json()
      const { tokens: newTokens, user: userData } = data

      setTokens(newTokens)
      setUser({
        userId: userData.userId,
        email: userData.email,
        username: userData.username,
        role: userData.role,
      })

      // Store tokens in localStorage
      localStorage.setItem('authTokens', JSON.stringify(newTokens))
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem('authTokens')
  }

  const refreshToken = async () => {
    if (!tokens?.refreshToken) return

    try {
      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newTokens = data.tokens

      setTokens(newTokens)
      localStorage.setItem('authTokens', JSON.stringify(newTokens))
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout() // Logout if refresh fails
    }
  }

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}