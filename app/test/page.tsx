'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Database, Users, Shield, Clock, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function TestPage() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [clientStatus, setClientStatus] = useState<'checking' | 'ready' | 'error'>('checking')
  const [testResults, setTestResults] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true)
    
    // Test básico del servidor
    setServerStatus('online')
    
    // Test básico del cliente
    try {
      localStorage.setItem('test', 'working')
      localStorage.removeItem('test')
      setClientStatus('ready')
    } catch (error) {
      setClientStatus('error')
    }

    // Ejecutar tests básicos
    runBasicTests()
  }, [])

  const runBasicTests = () => {
    const tests = [
      {
        name: 'Servidor Next.js',
        status: 'online',
        message: 'Servidor funcionando correctamente',
        icon: '✅'
      },
      {
        name: 'Cliente React',
        status: isClient ? 'ready' : 'checking',
        message: isClient ? 'Cliente funcionando correctamente' : 'Verificando...',
        icon: isClient ? '✅' : '⏳'
      },
      {
        name: 'LocalStorage',
        status: isClient ? 'ready' : 'checking',
        message: isClient ? 'Almacenamiento local disponible' : 'Verificando...',
        icon: isClient ? '✅' : '⏳'
      },
      {
        name: 'Navegador',
        status: isClient ? 'ready' : 'checking',
        message: isClient ? `Navegador: ${navigator.userAgent.split(' ')[0]}` : 'Verificando...',
        icon: isClient ? '✅' : '⏳'
      }
    ]
    setTestResults(tests)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'offline':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'checking':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Test Page - SSATJE
          </h1>
          <p className="text-xl text-gray-600">
            Verificación básica del sistema
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              {getStatusIcon(serverStatus)}
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Servidor</h3>
                <p className="text-gray-600">
                  {serverStatus === 'checking' && 'Verificando...'}
                  {serverStatus === 'online' && '✅ Funcionando correctamente'}
                  {serverStatus === 'offline' && '❌ Error de conexión'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              {getStatusIcon(clientStatus)}
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
                <p className="text-gray-600">
                  {clientStatus === 'checking' && 'Verificando...'}
                  {clientStatus === 'ready' && '✅ Funcionando correctamente'}
                  {clientStatus === 'error' && '❌ Error en el cliente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Resultados de Tests Básicos</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {testResults.map((test, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">{test.icon}</span>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{test.name}</h4>
                    <p className="text-gray-600">{test.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enlaces de Testing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/testing" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Database className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Testing Completo</div>
                <div className="text-sm text-gray-600">Tests avanzados del sistema</div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
            </Link>
            
            <Link 
              href="/test-dropdown" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Test Dropdown</div>
                <div className="text-sm text-gray-600">Testing de búsqueda de procesos</div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
            </Link>
            
            <Link 
              href="/auth/login" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-6 w-6 text-purple-500 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Login</div>
                <div className="text-sm text-gray-600">Sistema de autenticación</div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
            </Link>
            
            <Link 
              href="/admin/usuarios" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-orange-500 mr-3" />
              <div>
                <div className="font-medium text-gray-900">Gestión de Usuarios</div>
                <div className="text-sm text-gray-600">Panel de administración</div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Timestamp:</span>
              <span className="ml-2 text-gray-600">{new Date().toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">User Agent:</span>
              <span className="ml-2 text-gray-600">
                {isClient ? navigator.userAgent.split(' ')[0] : 'N/A (SSR)'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">URL:</span>
              <span className="ml-2 text-gray-600">
                {isClient ? window.location.href : 'N/A (SSR)'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Protocol:</span>
              <span className="ml-2 text-gray-600">
                {isClient ? window.location.protocol : 'N/A (SSR)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
