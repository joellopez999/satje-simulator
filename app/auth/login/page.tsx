'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Eye, EyeOff, LogIn, Settings, User, Briefcase } from 'lucide-react'
import { useUser } from '@/app/providers'
import { validatePassword, getUserPassword } from '@/lib/password-utils'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [autoFilled, setAutoFilled] = useState(false)

  // Usuarios de prueba para desarrollo
  const testUsers = [
    {
      email: 'admin@satje.com',
      password: 'admin123',
      name: 'Administrador SATJE',
      role: 'admin'
    },
    {
      email: 'juez@satje.com',
      password: 'juez123',
      name: 'Dr. Juan Pérez',
      role: 'juez'
    },
    {
      email: 'secretario@satje.com',
      password: 'secretario123',
      name: 'Lic. María González',
      role: 'secretario'
    },
    {
      email: 'abogado@satje.com',
      password: 'abogado123',
      name: 'Dr. Carlos Rodríguez',
      role: 'abogado'
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleQuickLogin = (role: string) => {
    // Primero buscar en el sistema de gestión de usuarios
    const storedUsers = JSON.parse(localStorage.getItem('satje_users') || '[]')
    const storedUser = storedUsers.find((u: any) => u.role === role)
    
    if (storedUser) {
      // Obtener la contraseña del sistema
      const userPassword = getUserPassword(storedUser.id)
      const password = userPassword ? userPassword.password : 'Sin contraseña'
      
      setFormData({
        email: storedUser.email,
        password: password
      })
      setAutoFilled(true)
      
      // Ocultar el indicador después de 3 segundos
      setTimeout(() => setAutoFilled(false), 3000)
      return
    }

    // Fallback: usar usuarios de prueba
    const user = testUsers.find(u => u.role === role)
    if (!user) {
      alert('Usuario no encontrado')
      return
    }

    // Llenar los campos del formulario
    setFormData({
      email: user.email,
      password: user.password
    })
    setAutoFilled(true)
    
    // Ocultar el indicador después de 3 segundos
    setTimeout(() => setAutoFilled(false), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Primero intentar con el sistema de gestión de usuarios
      const storedUsers = JSON.parse(localStorage.getItem('satje_users') || '[]')
      const storedUser = storedUsers.find((u: any) => u.email === formData.email)
      
      if (storedUser) {
        // Usar el sistema de contraseñas
        const isValidPassword = validatePassword(storedUser.id, formData.password)
        
        if (!isValidPassword) {
          alert('Contraseña incorrecta')
          setIsLoading(false)
          return
        }

        // Guardar usuario en localStorage
        const userSession = {
          id: storedUser.id,
          email: storedUser.email,
          name: storedUser.name,
          role: storedUser.role,
          loginTime: new Date().toISOString()
        }

        localStorage.setItem('satje_user_session', JSON.stringify(userSession))
        
        // Crear log de login
        const loginLog = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: storedUser.id,
          user_email: storedUser.email,
          user_name: storedUser.name,
          user_role: storedUser.role,
          action: 'login',
          description: 'Usuario inició sesión',
          timestamp: new Date().toISOString(),
          ip_address: 'localhost',
          user_agent: navigator.userAgent
        }

        // Guardar log en localStorage
        const existingLogs = JSON.parse(localStorage.getItem('satje_activity_logs') || '[]')
        existingLogs.push(loginLog)
        localStorage.setItem('satje_activity_logs', JSON.stringify(existingLogs))

        // Actualizar el contexto de usuario
        login(userSession)

        alert(`Bienvenido, ${storedUser.name}`)
        router.push('/')
        return
      }

      // Fallback: Buscar usuario en la lista de prueba (para compatibilidad)
      const user = testUsers.find(u => u.email === formData.email && u.password === formData.password)
      
      if (!user) {
        alert('Credenciales incorrectas')
        setIsLoading(false)
        return
      }

      // Guardar usuario en localStorage
      const userSession = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: user.email,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString()
      }

      localStorage.setItem('satje_user_session', JSON.stringify(userSession))
      
      // Crear log de login
      const loginLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userSession.id,
        user_email: user.email,
        user_name: user.name,
        user_role: user.role,
        action: 'login',
        description: 'Usuario inició sesión',
        timestamp: new Date().toISOString(),
        ip_address: 'localhost',
        user_agent: navigator.userAgent
      }

      // Guardar log en localStorage
      const existingLogs = JSON.parse(localStorage.getItem('satje_activity_logs') || '[]')
      existingLogs.push(loginLog)
      localStorage.setItem('satje_activity_logs', JSON.stringify(existingLogs))

      // Actualizar el contexto de usuario
      login({
        ...userSession,
        role: user.role as 'admin' | 'juez' | 'secretario' | 'abogado' | 'public'
      })

      alert(`Bienvenido, ${user.name}`)
      router.push('/')
      
    } catch (error) {
      console.error('Error en login:', error)
      alert('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-judicial-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Scale className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-judicial-900">
            SATJE Simulator
          </h2>
          <p className="mt-2 text-sm text-judicial-600">
            Sistema de Administración de Trámites Judiciales Electrónicos
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {autoFilled && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">
                  Campos llenados automáticamente
                </span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-judicial-700">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-field mt-1"
                placeholder="usuario@satje.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-judicial-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-judicial-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-judicial-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          {/* Botón de regreso */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                ¿No desea iniciar sesión?
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Regresar a Búsqueda de Procesos
              </a>
            </div>
          </div>

          {/* Botones de roles de prueba */}
          <div className="mt-8 p-4 bg-judicial-50 rounded-lg">
            <h3 className="text-sm font-medium text-judicial-900 mb-2">Acceso Rápido por Rol:</h3>
            <p className="text-xs text-judicial-600 mb-4">Haga clic en un botón para llenar automáticamente los campos</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin('admin')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Administrador
              </button>
              <button
                onClick={() => handleQuickLogin('juez')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2"
              >
                <Scale className="h-4 w-4" />
                Juez
              </button>
              <button
                onClick={() => handleQuickLogin('secretario')}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" />
                Secretario
              </button>
              <button
                onClick={() => handleQuickLogin('abogado')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Abogado
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-judicial-200">
              <h4 className="text-xs font-medium text-judicial-700 mb-2">Credenciales del Sistema:</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-judicial-600">Admin:</span>
                  <span className="font-mono text-judicial-800">admin@satje.ec / [Ver en Gestión de Usuarios]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-judicial-600">Juez:</span>
                  <span className="font-mono text-judicial-800">juez@satje.ec / [Ver en Gestión de Usuarios]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-judicial-600">Secretario:</span>
                  <span className="font-mono text-judicial-800">secretario@satje.ec / [Ver en Gestión de Usuarios]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-judicial-600">Abogado:</span>
                  <span className="font-mono text-judicial-800">abogado@satje.ec / [Ver en Gestión de Usuarios]</span>
                </div>
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                  <strong>Nota:</strong> Las contraseñas se generan automáticamente al crear usuarios. 
                  Ve a "Administración → Usuarios" para ver las contraseñas actuales.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
