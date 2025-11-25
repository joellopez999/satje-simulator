'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Database, Users, Shield, Clock, RefreshCw } from 'lucide-react'
import { useUser } from '@/app/providers'
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  validateUserPassword,
  getUserByEmail 
} from '@/lib/supabase-auth'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'pending'
  message: string
  details?: any
}

export default function TestingPage() {
  const { user } = useUser()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testData, setTestData] = useState<any>(null)

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const results: TestResult[] = []
    
    // Test 1: Conexión básica
    try {
      const users = await getUsers()
      results.push({
        name: 'Conexión a Supabase',
        status: 'pass',
        message: `Conexión exitosa. ${users.length} usuarios encontrados`,
        details: { userCount: users.length }
      })
    } catch (error) {
      results.push({
        name: 'Conexión a Supabase',
        status: 'fail',
        message: `Error de conexión: ${error}`,
        details: { error: error }
      })
    }

    // Test 2: Autenticación
    try {
      const testUser = await getUserByEmail('admin@satje.ec')
      if (testUser) {
        const isValid = await validateUserPassword(testUser.id, 'admin123')
        results.push({
          name: 'Autenticación de usuarios',
          status: isValid ? 'pass' : 'fail',
          message: isValid ? 'Login de admin funcionando' : 'Contraseña incorrecta',
          details: { user: testUser.email, passwordValid: isValid }
        })
      } else {
        results.push({
          name: 'Autenticación de usuarios',
          status: 'fail',
          message: 'Usuario admin no encontrado',
          details: { error: 'User not found' }
        })
      }
    } catch (error) {
      results.push({
        name: 'Autenticación de usuarios',
        status: 'fail',
        message: `Error en autenticación: ${error}`,
        details: { error: error }
      })
    }

    // Test 3: Gestión de usuarios
    try {
      const testUserData = {
        email: 'test@satje.ec',
        name: 'Usuario de Prueba',
        role: 'tercero' as const,
        is_active: true
      }
      
      const newUser = await createUser(testUserData)
      if (newUser) {
        results.push({
          name: 'Creación de usuarios',
          status: 'pass',
          message: 'Usuario de prueba creado exitosamente',
          details: { userId: newUser.id, email: newUser.email }
        })
        
        // Limpiar usuario de prueba
        await deleteUser(newUser.id)
        results.push({
          name: 'Eliminación de usuarios',
          status: 'pass',
          message: 'Usuario de prueba eliminado correctamente',
          details: { deletedUserId: newUser.id }
        })
      } else {
        results.push({
          name: 'Creación de usuarios',
          status: 'fail',
          message: 'No se pudo crear usuario de prueba',
          details: { error: 'Create user failed' }
        })
      }
    } catch (error) {
      results.push({
        name: 'Gestión de usuarios',
        status: 'fail',
        message: `Error en gestión de usuarios: ${error}`,
        details: { error: error }
      })
    }

    // Test 4: Contexto de usuario
    try {
      if (user) {
        results.push({
          name: 'Contexto de usuario',
          status: 'pass',
          message: `Usuario logueado: ${user.name} (${user.role})`,
          details: { 
            userId: user.id, 
            email: user.email, 
            role: user.role 
          }
        })
      } else {
        results.push({
          name: 'Contexto de usuario',
          status: 'fail',
          message: 'No hay usuario logueado',
          details: { error: 'No user context' }
        })
      }
    } catch (error) {
      results.push({
        name: 'Contexto de usuario',
        status: 'fail',
        message: `Error en contexto: ${error}`,
        details: { error: error }
      })
    }

    // Test 5: LocalStorage
    try {
      const testKey = 'satje_test_' + Date.now()
      const testValue = { test: true, timestamp: Date.now() }
      
      localStorage.setItem(testKey, JSON.stringify(testValue))
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}')
      localStorage.removeItem(testKey)
      
      if (retrieved.test === true) {
        results.push({
          name: 'LocalStorage',
          status: 'pass',
          message: 'LocalStorage funcionando correctamente',
          details: { testKey, retrieved }
        })
      } else {
        results.push({
          name: 'LocalStorage',
          status: 'fail',
          message: 'Error en LocalStorage',
          details: { testKey, retrieved }
        })
      }
    } catch (error) {
      results.push({
        name: 'LocalStorage',
        status: 'fail',
        message: `Error en LocalStorage: ${error}`,
        details: { error: error }
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const passedTests = testResults.filter(r => r.status === 'pass').length
  const failedTests = testResults.filter(r => r.status === 'fail').length
  const totalTests = testResults.length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Panel de Testing - SSATJE
          </h1>
          <p className="text-gray-600">
            Verificación completa del sistema de autenticación y funcionalidades
          </p>
        </div>

        {/* Botón de ejecución */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Ejecutar Tests del Sistema
              </h2>
              <p className="text-gray-600">
                Verifica la conectividad, autenticación y funcionalidades del sistema
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Database className="h-5 w-5" />
              )}
              {isRunning ? 'Ejecutando...' : 'Ejecutar Tests'}
            </button>
          </div>
        </div>

        {/* Resumen de resultados */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Resultados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-green-800">{passedTests}</div>
                    <div className="text-green-600">Tests Exitosos</div>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-red-800">{failedTests}</div>
                    <div className="text-red-600">Tests Fallidos</div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-blue-800">{totalTests}</div>
                    <div className="text-blue-600">Total de Tests</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de resultados */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resultados Detallados</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {testResults.map((result, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">
                          {result.name}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-600">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                            Ver detalles técnicos
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información del usuario actual */}
        {user && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuario Actual</h3>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-4" />
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-gray-600">{user.email}</div>
                <div className="text-sm text-gray-500">Rol: {user.role}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}







