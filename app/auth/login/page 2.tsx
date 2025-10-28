'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scale, Eye, EyeOff, LogIn, Settings, User, Briefcase } from 'lucide-react'
import { useUser } from '@/app/providers'
import { getUserByEmail, validateUserPassword, initializeDefaultUsers } from '@/lib/supabase-auth'

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
      email: 'admin@satje.ec',
      password: 'admin123',
      name: 'Administrador SATJE',
      role: 'admin'
    },
    {
      email: 'juez@satje.ec',
      password: 'juez123',
      name: 'Dr. Juan Pérez',
      role: 'juez'
    },
    {
      email: 'secretario@satje.ec',
      password: 'secretario123',
      name: 'Lic. María González',
      role: 'secretario'
    },
    {
      email: 'abogado@satje.ec',
      password: 'abogado123',
      name: 'Dr. Carlos Rodríguez',
      role: 'abogado'
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleQuickLogin = (user: any) => {
    // Llenar los campos del formulario
    setFormData({
      email: user.email,
      password: user.password
    })
    setAutoFilled(true)
    
    // Ocultar el indicador después de 3 segundos
    setTimeout(() => setAutoFilled(false), 3000)
  }

  // Función para inicializar usuarios por defecto en Supabase
  const initializeDefaultData = async () => {
    try {
      await initializeDefaultUsers()
      console.log('✅ Usuarios por defecto inicializados en Supabase')
    } catch (error) {
      console.error('Error inicializando usuarios:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Inicializar usuarios por defecto si no existen
      await initializeDefaultData()
      
      // Buscar usuario en Supabase
      const user = await getUserByEmail(formData.email)
      
      if (!user) {
        alert('Usuario no encontrado')
        setIsLoading(false)
        return
      }

      if (!user.is_active) {
        alert('Usuario inactivo')
        setIsLoading(false)
        return
      }

      // Verificar contraseña
      const isValidPassword = await validateUserPassword(user.id, formData.password)
      
      if (!isValidPassword) {
        alert('Contraseña incorrecta')
        setIsLoading(false)
        return
      }

      // Crear sesión de usuario
      const userSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString()
      }

      // Guardar sesión en localStorage (para el contexto de React)
      localStorage.setItem('satje_user_session', JSON.stringify(userSession))
      
      // Crear log de login
      const loginLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
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
      login(userSession)

      alert(`Bienvenido, ${user.name}`)
      router.push('/')

    } catch (error) {
      console.error('Error during login:', error)
      alert('Error durante el inicio de sesión')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Inicializar usuarios por defecto automáticamente
    initializeDefaultData()
  }, [])

  return (
    <div className="min-h-screen bg-judicial-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Scale className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            SATJE Simulator
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Administración de Tribunales Judiciales
          </p>
        </div>

        {/* Formulario de Login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="usuario@satje.ec"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </div>
              )}
            </button>
          </div>

          {/* Indicador de auto-llenado */}
          {autoFilled && (
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <User className="h-3 w-3 mr-1" />
                Campos auto-llenados
              </div>
            </div>
          )}
        </form>

        {/* Usuarios de prueba */}
        <div className="mt-8">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Usuarios de prueba
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {testUsers.map((user, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickLogin(user)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <div className="flex items-center">
                    {user.role === 'admin' && <Settings className="h-3 w-3 mr-1" />}
                    {user.role === 'juez' && <Scale className="h-3 w-3 mr-1" />}
                    {user.role === 'secretario' && <User className="h-3 w-3 mr-1" />}
                    {user.role === 'abogado' && <Briefcase className="h-3 w-3 mr-1" />}
                    <span className="truncate">{user.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Sistema de gestión judicial para administración de procesos
          </p>
        </div>
      </div>
    </div>
  )
}
