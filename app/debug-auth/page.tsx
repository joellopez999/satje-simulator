'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Database, Users, Key, Activity, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'

export default function DebugAuthPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [debugData, setDebugData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const loadDebugData = () => {
    setIsLoading(true)
    
    try {
      const data = {
        users: JSON.parse(localStorage.getItem('satje_users') || '[]'),
        userSession: JSON.parse(localStorage.getItem('satje_user_session') || 'null'),
        passwords: JSON.parse(localStorage.getItem('satje_user_passwords') || '[]'),
        processes: JSON.parse(localStorage.getItem('satje_processes') || '[]'),
        activities: JSON.parse(localStorage.getItem('satje_activities') || '[]'),
        activityLogs: JSON.parse(localStorage.getItem('satje_activity_logs') || '[]')
      }
      
      setDebugData(data)
    } catch (error) {
      console.error('Error loading debug data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeDefaultData = () => {
    // Crear usuarios por defecto
    const defaultUsers = [
      {
        id: '1',
        name: 'Administrador del Sistema',
        email: 'admin@satje.ec',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Dr. Juan Pérez',
        email: 'juez@satje.ec',
        role: 'juez',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Lic. María González',
        email: 'secretario@satje.ec',
        role: 'secretario',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Abg. Carlos López',
        email: 'abogado@satje.ec',
        role: 'abogado',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]

    // Crear contraseñas por defecto
    const defaultPasswords = [
      {
        user_id: '1',
        password: 'admin123',
        is_temporary: false,
        created_at: new Date().toISOString()
      },
      {
        user_id: '2',
        password: 'juez123',
        is_temporary: false,
        created_at: new Date().toISOString()
      },
      {
        user_id: '3',
        password: 'secretario123',
        is_temporary: false,
        created_at: new Date().toISOString()
      },
      {
        user_id: '4',
        password: 'abogado123',
        is_temporary: false,
        created_at: new Date().toISOString()
      }
    ]

    // Guardar en localStorage
    localStorage.setItem('satje_users', JSON.stringify(defaultUsers))
    localStorage.setItem('satje_user_passwords', JSON.stringify(defaultPasswords))
    localStorage.setItem('satje_processes', JSON.stringify([]))
    localStorage.setItem('satje_activities', JSON.stringify([]))
    localStorage.setItem('satje_activity_logs', JSON.stringify([]))

    alert('Datos inicializados correctamente. Recarga la página.')
    loadDebugData()
  }

  const clearAllData = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear()
      alert('Todos los datos han sido eliminados.')
      loadDebugData()
    }
  }

  useEffect(() => {
    loadDebugData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔍 Diagnóstico de Autenticación
            </h1>
            <p className="text-gray-600">
              Verifica el estado del sistema de autenticación y datos
            </p>
          </div>

          {/* Botones de acción */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={loadDebugData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Recargar Datos
              </button>
              
              <button
                onClick={initializeDefaultData}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Database className="h-4 w-4" />
                Inicializar Datos
              </button>
              
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Limpiar Todo
              </button>
            </div>
          </div>

          {/* Estado de los datos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuarios */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Usuarios</h3>
                {debugData.users?.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                Total: {debugData.users?.length || 0}
              </div>
              
              {debugData.users?.length > 0 ? (
                <div className="space-y-2">
                  {debugData.users.slice(0, 3).map((user: any, index: number) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500">{user.email} - {user.role}</div>
                    </div>
                  ))}
                  {debugData.users.length > 3 && (
                    <div className="text-sm text-gray-500">
                      ... y {debugData.users.length - 3} más
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  ❌ No se encontraron usuarios
                </div>
              )}
            </div>

            {/* Sesión actual */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Sesión Actual</h3>
                {debugData.userSession ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              {debugData.userSession ? (
                <div className="text-sm space-y-1">
                  <div><strong>Usuario:</strong> {debugData.userSession.name}</div>
                  <div><strong>Email:</strong> {debugData.userSession.email}</div>
                  <div><strong>Rol:</strong> {debugData.userSession.role}</div>
                  <div><strong>Login:</strong> {new Date(debugData.userSession.loginTime).toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  ❌ No hay sesión activa
                </div>
              )}
            </div>

            {/* Contraseñas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Key className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contraseñas</h3>
                {debugData.passwords?.length > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                Total: {debugData.passwords?.length || 0}
              </div>
              
              {debugData.passwords?.length > 0 ? (
                <div className="text-sm text-green-600">
                  ✅ Contraseñas configuradas
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  ❌ No se encontraron contraseñas
                </div>
              )}
            </div>

            {/* Procesos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Procesos</h3>
              </div>
              
              <div className="text-sm text-gray-600">
                Total: {debugData.processes?.length || 0}
              </div>
            </div>
          </div>

          {/* Credenciales de acceso */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              🔑 Credenciales de Acceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Admin:</strong> admin@satje.ec / admin123
              </div>
              <div>
                <strong>Juez:</strong> juez@satje.ec / juez123
              </div>
              <div>
                <strong>Secretario:</strong> secretario@satje.ec / secretario123
              </div>
              <div>
                <strong>Abogado:</strong> abogado@satje.ec / abogado123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
