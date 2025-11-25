'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Database, CheckCircle } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/app/providers'
import { getProcesses, getUsers } from '@/lib/storage'

export default function SyncPage() {
  const { user } = useUser()
  const [processes, setProcesses] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allProcesses, allUsers] = await Promise.all([
          fetch('/api/processes/search').then(r => r.json()),
          getUsers()
        ])
        setProcesses(allProcesses)
        setUsers(allUsers)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleMigrateExpedientes = async () => {
    if (!confirm('¿Está seguro de que desea ejecutar la migración de expedientes?\n\nEsto creará expedientes de primera instancia para todos los procesos que no los tengan.')) {
      return
    }

    setIsMigrating(true)
    setMigrationResult(null)

    try {
      const response = await fetch('/api/processes/migrate-expedientes')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en la migración')
      }

      setMigrationResult(result)
      alert(`✅ Migración completada:\n\n- Procesos totales: ${result.totalProcesses}\n- Procesos sin expedientes: ${result.processesWithoutExpedientes}\n- Expedientes creados: ${result.expedientesCreated}`)

      // Recargar datos
      const allProcesses = await fetch('/api/processes/search').then(r => r.json())
      setProcesses(allProcesses)
    } catch (error) {
      console.error('Error en migración:', error)
      alert('❌ Error al ejecutar la migración: ' + (error as Error).message)
    } finally {
      setIsMigrating(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-judicial-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-judicial-900 mb-4">Acceso Denegado</h1>
          <p className="text-judicial-600 mb-6">Solo los administradores pueden acceder a esta página.</p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-judicial-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 lg:ml-64">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-judicial-900 mb-2">
                Estado del Sistema
              </h1>
              <p className="text-judicial-600">
                Monitoreo de datos y estado de la base de datos remota
              </p>
            </div>

            {/* Estadísticas Actuales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {isLoading ? '...' : processes.length}
                </div>
                <div className="text-sm text-judicial-600">Procesos</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {isLoading ? '...' : users.length}
                </div>
                <div className="text-sm text-judicial-600">Usuarios</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {isLoading ? '...' : processes.filter(p => p.estado === 'activo').length}
                </div>
                <div className="text-sm text-judicial-600">Activos</div>
              </div>
            </div>

            {/* Información de Base de Datos */}
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-judicial-900">
                  Conexión a Supabase
                </h2>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-800 font-medium">
                    Conectado a Base de Datos Remota
                  </p>
                </div>
                <p className="text-green-700 mt-2 text-sm">
                  El sistema está utilizando Supabase como backend. Todos los datos se sincronizan automáticamente en tiempo real.
                </p>
              </div>
            </div>

            {/* Migración de Expedientes */}
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-judicial-900">
                  Herramientas de Migración
                </h2>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Migrar Expedientes</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Esta herramienta crea expedientes de primera instancia para todos los procesos que no los tienen.
                  Útil para reparar procesos creados antes del fix de expedientes.
                </p>
                <button
                  onClick={handleMigrateExpedientes}
                  disabled={isMigrating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isMigrating ? 'animate-spin' : ''}`} />
                  {isMigrating ? 'Migrando...' : 'Ejecutar Migración'}
                </button>
              </div>

              {migrationResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">✅ Resultado de Migración</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Total de procesos:</span>
                      <p className="text-green-700">{migrationResult.totalProcesses}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Procesos sin expedientes:</span>
                      <p className="text-green-700">{migrationResult.processesWithoutExpedientes}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Expedientes creados:</span>
                      <p className="text-green-700">{migrationResult.expedientesCreated}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Estado:</span>
                      <p className="text-green-700">{migrationResult.message}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información del Navegador */}
            <div className="card mt-6">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-6 w-6 text-judicial-600" />
                <h2 className="text-xl font-semibold text-judicial-900">
                  Información de Sesión
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-judicial-700">Navegador:</span>
                  <p className="text-judicial-600">{typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-judicial-700">Usuario Actual:</span>
                  <p className="text-judicial-600">{user?.name} ({user?.role})</p>
                </div>
                <div>
                  <span className="font-medium text-judicial-700">Email:</span>
                  <p className="text-judicial-600">{user?.email}</p>
                </div>
                <div>
                  <span className="font-medium text-judicial-700">Última Actualización:</span>
                  <p className="text-judicial-600">{new Date().toLocaleString('es-EC')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}