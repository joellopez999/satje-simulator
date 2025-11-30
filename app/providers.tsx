'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'juez' | 'secretario' | 'abogado' | 'tercero' | 'public'
  loginTime?: string
}

interface UserContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
  checkAuth: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = () => {
    try {
      const userSession = localStorage.getItem('satje_user_session')
      if (userSession) {
        const userData = JSON.parse(userSession)
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()

    // Check session timeout every minute
    const interval = setInterval(() => {
      checkSessionTimeout()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const checkSessionTimeout = () => {
    try {
      const userSession = localStorage.getItem('satje_user_session')
      if (userSession) {
        const userData = JSON.parse(userSession)

        // Admin users never timeout
        if (userData.role === 'admin') return

        if (userData.loginTime) {
          const loginTime = new Date(userData.loginTime).getTime()
          const currentTime = new Date().getTime()
          const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in ms

          if (currentTime - loginTime > thirtyMinutes) {
            console.log('Session timed out')
            logout()
            alert('Su sesión ha expirado por inactividad (30 min). Por favor inicie sesión nuevamente.')
          }
        }
      }
    } catch (error) {
      console.error('Error checking session timeout:', error)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
    // Forzar verificación de autenticación después del login
    setTimeout(() => {
      checkAuth()
    }, 100)
  }

  const logout = () => {
    // Crear log de logout
    if (user) {
      const logoutLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        user_role: user.role,
        action: 'logout',
        description: 'Usuario cerró sesión',
        timestamp: new Date().toISOString(),
        ip_address: 'localhost',
        user_agent: navigator.userAgent
      }

      // Guardar log en localStorage
      const existingLogs = JSON.parse(localStorage.getItem('satje_activity_logs') || '[]')
      existingLogs.push(logoutLog)
      localStorage.setItem('satje_activity_logs', JSON.stringify(existingLogs))
    }

    setUser(null)
    localStorage.removeItem('satje_user_session')

    // Redirigir al login
    window.location.href = '/auth/login'
  }

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading, checkAuth }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a Providers')
  }
  return context
}