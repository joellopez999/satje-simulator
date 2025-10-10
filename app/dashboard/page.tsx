'use client'

import { useState, useEffect } from 'react'
import { FileText, Users, Scale, Shield, Briefcase, Settings, TrendingUp, Clock, CheckCircle, AlertCircle, Eye, Plus } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { useUser } from '@/app/providers'
import { getProcesses } from '@/lib/simple-storage'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalProcesos: 0,
    procesosActivos: 0,
    procesosAcumulados: 0,
    procesosArchivados: 0,
    escritosPendientes: 0,
    actividadesRecientes: [] as any[]
  })
  const { user } = useUser()

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const procesos = getProcesses()
        
        // Calcular estadísticas
        const totalProcesos = procesos.length
        const procesosActivos = procesos.filter(p => p.estado === 'activo').length
        const procesosAcumulados = procesos.filter(p => p.estado === 'acumulado').length
        const procesosArchivados = procesos.filter(p => p.estado === 'archivado').length
        
        // Contar escritos pendientes (actividades no despachadas)
        let escritosPendientes = 0
        const actividadesRecientes: any[] = []
        
        procesos.forEach(proceso => {
          if (proceso.expedientes) {
            proceso.expedientes.forEach(expediente => {
              if (expediente.actividades) {
                expediente.actividades.forEach(actividad => {
                  if (actividad.tipo === 'escrito' && !actividad.despachado) {
                    escritosPendientes++
                  }
                  
                  // Agregar a actividades recientes (últimas 5)
                  if (actividadesRecientes.length < 5) {
                    actividadesRecientes.push({
                      id: actividad.id,
                      tipo: actividad.tipo,
                      titulo: actividad.titulo,
                      creado_por: actividad.creado_por,
                      fecha: actividad.fecha_creacion,
                      proceso: proceso.numero_causa
                    })
                  }
                })
              }
            })
          }
        })
        
        // Ordenar actividades por fecha (más recientes primero)
        actividadesRecientes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        
        setStats({
          totalProcesos,
          procesosActivos,
          procesosAcumulados,
          procesosArchivados,
          escritosPendientes,
          actividadesRecientes
        })
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'providencia': return <Scale className="h-5 w-5 text-blue-600" />
      case 'razon': return <Shield className="h-5 w-5 text-green-600" />
      case 'escrito': return <Briefcase className="h-5 w-5 text-purple-600" />
      default: return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard SATJE
              </h1>
              <p className="text-gray-600">
                Panel de control del Sistema Automático de Trámite Judicial Ecuatoriano
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Procesos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProcesos}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Procesos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.procesosActivos}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Escritos Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.escritosPendientes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Procesos Acumulados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.procesosAcumulados}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Procesos</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Activos</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.procesosActivos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Acumulados</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.procesosAcumulados}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Archivados</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.procesosArchivados}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h3>
                <div className="space-y-3">
                  {stats.actividadesRecientes.length > 0 ? (
                    stats.actividadesRecientes.map((actividad) => (
                      <div key={actividad.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        {getTipoIcon(actividad.tipo)}
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{actividad.titulo}</p>
                          <p className="text-xs text-gray-500">
                            {actividad.creado_por} • {actividad.proceso} • {new Date(actividad.fecha).toLocaleDateString('es-EC')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>No hay actividades recientes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user?.role === 'juez' && (
                  <>
                    <a href="/operadores/providencias" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Scale className="h-6 w-6 text-blue-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Crear Providencia</h4>
                      <p className="text-sm text-gray-600">Emitir nueva providencia</p>
                    </a>
                    <a href="/operadores/instancias" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Settings className="h-6 w-6 text-green-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Gestión de Instancias</h4>
                      <p className="text-sm text-gray-600">Aperturar instancias</p>
                    </a>
                  </>
                )}
                
                {user?.role === 'secretario' && (
                  <a href="/operadores/secretaria" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Shield className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Actuación de Secretaría</h4>
                    <p className="text-sm text-gray-600">Registrar actuación</p>
                  </a>
                )}
                
                {user?.role === 'admin' && (
                  <>
                    <a href="/admin/procesos" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <FileText className="h-6 w-6 text-blue-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Gestionar Procesos</h4>
                      <p className="text-sm text-gray-600">Administrar procesos</p>
                    </a>
                    <a href="/admin/usuarios" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <Users className="h-6 w-6 text-green-600 mb-2" />
                      <h4 className="font-medium text-gray-900">Gestionar Usuarios</h4>
                      <p className="text-sm text-gray-600">Administrar usuarios</p>
                    </a>
                  </>
                )}
                
                <a href="/operadores" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Eye className="h-6 w-6 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Buzón de Despacho</h4>
                  <p className="text-sm text-gray-600">Revisar escritos pendientes</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}