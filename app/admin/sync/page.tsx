'use client'

import { useState } from 'react'
import { RefreshCw, Database, Trash2, Download, Upload } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/app/providers'
import { resetStorage, getProcesses, getUsers } from '@/lib/storage'

export default function SyncPage() {
  const { user } = useUser()
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async () => {
    if (!confirm('¿Está seguro de que desea reinicializar todos los datos? Esta acción no se puede deshacer.')) {
      return
    }
    
    setIsResetting(true)
    try {
      resetStorage()
      alert('Datos reinicializados exitosamente. Recargue la página para ver los cambios.')
    } catch (error) {
      console.error('Error al reinicializar:', error)
      alert('Error al reinicializar los datos')
    } finally {
      setIsResetting(false)
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

  const processes = getProcesses()
  const users = getUsers()

  return (
    <div className="min-h-screen bg-judicial-50">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-judicial-900 mb-2">
                Sincronización de Datos
              </h1>
              <p className="text-judicial-600">
                Administre y sincronice los datos del sistema entre navegadores
              </p>
            </div>

            {/* Estadísticas Actuales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">
                  {processes.length}
                </div>
                <div className="text-sm text-judicial-600">Procesos</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {users.length}
                </div>
                <div className="text-sm text-judicial-600">Usuarios</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {processes.filter(p => p.estado === 'activo').length}
                </div>
                <div className="text-sm text-judicial-600">Activos</div>
              </div>
            </div>

            {/* Información del Problema */}
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-judicial-900">
                  Problema de Sincronización
                </h2>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-800">
                  <strong>Problema:</strong> Cada navegador (Chrome, Safari, Firefox) tiene su propio almacenamiento local independiente. 
                  Esto significa que los datos no se comparten entre navegadores.
                </p>
              </div>
              <div className="space-y-2 text-sm text-judicial-600">
                <p>• <strong>Chrome:</strong> Tiene sus propios datos en localStorage</p>
                <p>• <strong>Safari:</strong> Tiene sus propios datos en localStorage</p>
                <p>• <strong>Firefox:</strong> Tiene sus propios datos en localStorage</p>
              </div>
            </div>

            {/* Soluciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Solución 1: Reinicializar */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-judicial-900">
                    Reinicializar Datos
                  </h2>
                </div>
                <p className="text-judicial-600 mb-4">
                  Elimine todos los datos y reinicie con datos de ejemplo consistentes.
                </p>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="btn-primary flex items-center gap-2 w-full"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isResetting ? 'Reinicializando...' : 'Reinicializar Sistema'}
                </button>
              </div>

              {/* Solución 2: Exportar/Importar */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Download className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-judicial-900">
                    Sincronización Manual
                  </h2>
                </div>
                <p className="text-judicial-600 mb-4">
                  Para sincronizar entre navegadores:
                </p>
                <div className="space-y-2 text-sm text-judicial-600">
                  <p>1. Exporte datos desde un navegador</p>
                  <p>2. Importe en otro navegador</p>
                  <p>3. Los datos se sincronizarán</p>
                </div>
                <button
                  onClick={() => {
                    const data = {
                      processes: getProcesses(),
                      users: getUsers(),
                      timestamp: new Date().toISOString()
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `satje-backup-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="btn-secondary flex items-center gap-2 w-full mt-4"
                >
                  <Download className="h-4 w-4" />
                  Exportar Datos
                </button>
              </div>
            </div>

            {/* Información del Navegador */}
            <div className="card mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6 text-judicial-600" />
                <h2 className="text-xl font-semibold text-judicial-900">
                  Información del Navegador Actual
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-judicial-700">Navegador:</span>
                  <p className="text-judicial-600">{typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-judicial-700">Almacenamiento:</span>
                  <p className="text-judicial-600">localStorage</p>
                </div>
                <div>
                  <span className="font-medium text-judicial-700">Procesos:</span>
                  <p className="text-judicial-600">{processes.length} registros</p>
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