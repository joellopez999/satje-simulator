'use client'

import { useState, useEffect } from 'react'
import {
  History,
  FileText,
  Calendar,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { getProcesses } from '@/lib/storage'

export default function HistorialPage() {
  const [processes, setProcesses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState<'todos' | 'despachado' | 'pendiente'>('todos')
  const [filterPeriodo, setFilterPeriodo] = useState<'todos' | '7dias' | '30dias' | '90dias'>('todos')

  useEffect(() => {
    const loadProcesses = async () => {
      try {
        const response = await fetch('/api/processes/search')
        if (!response.ok) throw new Error('Error fetching processes')
        const allProcesses = await response.json()
        setProcesses(allProcesses)
      } catch (error) {
        console.error('Error loading processes:', error)
        setProcesses([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProcesses()
  }, [])

  // Obtener todos los escritos (despachados y pendientes)
  const todosLosEscritos = processes.flatMap(process =>
    process.expedientes?.flatMap((expediente: any) =>
      expediente.actividades
        ?.filter((actividad: any) => actividad.tipo === 'escrito')
        ?.map((actividad: any) => ({
          id: actividad.id,
          numero_causa: process.numero_causa,
          actor: process.actor,
          demandado: process.demandado,
          titulo: actividad.titulo,
          fecha_escrito: actividad.fecha_creacion,
          fecha_despacho: actividad.fecha_despacho,
          despachado: actividad.despachado,
          despachado_por: actividad.despachado_por,
          contenido: actividad.contenido,
          usuario_creador: actividad.metadata?.usuario_creador,
          tipo_petitorio: actividad.metadata?.tipo_petitorio || 'Escrito',
          dias_pendiente: actividad.despachado ? 0 : Math.floor((Date.now() - new Date(actividad.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24))
        })) || []
    ) || []
  ).filter(Boolean)

  // Filtrar escritos según los filtros
  const escritosFiltrados = todosLosEscritos.filter(escrito => {
    // Filtro por búsqueda
    const matchesSearch = searchTerm === '' ||
      escrito.numero_causa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrito.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrito.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrito.demandado.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por estado
    const matchesEstado = filterEstado === 'todos' ||
      (filterEstado === 'despachado' && escrito.despachado) ||
      (filterEstado === 'pendiente' && !escrito.despachado)

    // Filtro por período
    const now = Date.now()
    const fechaReferencia = escrito.despachado ? new Date(escrito.fecha_despacho).getTime() : new Date(escrito.fecha_escrito).getTime()
    const matchesPeriodo = filterPeriodo === 'todos' ||
      (filterPeriodo === '7dias' && (now - fechaReferencia) < (7 * 24 * 60 * 60 * 1000)) ||
      (filterPeriodo === '30dias' && (now - fechaReferencia) < (30 * 24 * 60 * 60 * 1000)) ||
      (filterPeriodo === '90dias' && (now - fechaReferencia) < (90 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesEstado && matchesPeriodo
  })

  const getEstadoColor = (despachado: boolean, diasPendiente: number) => {
    if (despachado) return 'bg-green-100 text-green-800'
    if (diasPendiente > 30) return 'bg-red-100 text-red-800'
    if (diasPendiente > 15) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getEstadoIcon = (despachado: boolean, diasPendiente: number) => {
    if (despachado) return <CheckCircle className="h-3 w-3" />
    if (diasPendiente > 30) return <AlertCircle className="h-3 w-3" />
    if (diasPendiente > 15) return <Clock className="h-3 w-3" />
    return <FileText className="h-3 w-3" />
  }

  const getEstadoTexto = (despachado: boolean, diasPendiente: number) => {
    if (despachado) return 'Despachado'
    if (diasPendiente > 30) return 'Vencido'
    if (diasPendiente > 15) return 'Urgente'
    return 'Normal'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-judicial-50">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          <div className="flex-1 lg:ml-64 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-judicial-50">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 lg:ml-64">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <History className="h-8 w-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-judicial-900">
                  Historial de Escritos
                </h1>
              </div>
              <p className="text-judicial-600">
                Consulte el historial completo de todos los escritos del sistema
              </p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-judicial-900">
                  Filtros de Búsqueda
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda por texto */}
                <div>
                  <label className="block text-sm font-medium text-judicial-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Número de causa, título, actor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 input-field w-full"
                    />
                  </div>
                </div>

                {/* Filtro por estado */}
                <div>
                  <label className="block text-sm font-medium text-judicial-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value as any)}
                    className="input-field w-full"
                  >
                    <option value="todos">Todos</option>
                    <option value="despachado">Despachados</option>
                    <option value="pendiente">Pendientes</option>
                  </select>
                </div>

                {/* Filtro por período */}
                <div>
                  <label className="block text-sm font-medium text-judicial-700 mb-2">
                    Período
                  </label>
                  <select
                    value={filterPeriodo}
                    onChange={(e) => setFilterPeriodo(e.target.value as any)}
                    className="input-field w-full"
                  >
                    <option value="todos">Todos</option>
                    <option value="7dias">Últimos 7 días</option>
                    <option value="30dias">Últimos 30 días</option>
                    <option value="90dias">Últimos 90 días</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando {escritosFiltrados.length} de {todosLosEscritos.length} escritos
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterEstado('todos')
                    setFilterPeriodo('todos')
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Lista de Escritos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resultados ({escritosFiltrados.length})
                </h3>
              </div>

              {escritosFiltrados.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron escritos
                  </h3>
                  <p className="text-gray-600">
                    Ajuste los filtros para ver más resultados
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {escritosFiltrados.map((escrito) => (
                    <div key={escrito.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {escrito.titulo}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getEstadoColor(escrito.despachado, escrito.dias_pendiente)}`}>
                              {getEstadoIcon(escrito.despachado, escrito.dias_pendiente)}
                              {getEstadoTexto(escrito.despachado, escrito.dias_pendiente)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Proceso:</span> {escrito.numero_causa}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Actor:</span> {escrito.actor}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Demandado:</span> {escrito.demandado}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Tipo:</span> {escrito.tipo_petitorio}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Fecha del escrito:</span> {new Date(escrito.fecha_escrito).toLocaleDateString('es-EC')}
                            </p>
                            {escrito.despachado ? (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Despachado:</span> {new Date(escrito.fecha_despacho).toLocaleDateString('es-EC')} por {escrito.despachado_por}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Días pendiente:</span> {escrito.dias_pendiente} días
                              </p>
                            )}
                          </div>

                          {/* Información del usuario creador */}
                          {escrito.usuario_creador && (
                            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <h5 className="text-sm font-medium text-blue-900 mb-2">Información del Creador</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                <p className="text-blue-800">
                                  <span className="font-medium">Nombre:</span> {escrito.usuario_creador.nombre}
                                </p>
                                <p className="text-blue-800">
                                  <span className="font-medium">Rol:</span> {escrito.usuario_creador.rol}
                                </p>
                                <p className="text-blue-800">
                                  <span className="font-medium">Email:</span> {escrito.usuario_creador.email}
                                </p>
                              </div>
                            </div>
                          )}

                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {escrito.contenido}
                          </p>
                        </div>

                        <div className="ml-6 flex flex-col gap-2 min-w-0 flex-shrink-0">
                          <button
                            onClick={() => alert(`Escrito: ${escrito.titulo}\nContenido: ${escrito.contenido}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-xs flex items-center gap-1 whitespace-nowrap"
                          >
                            <Eye className="h-3 w-3" />
                            Ver Escrito
                          </button>
                          <button
                            onClick={() => window.open(`/proceso/${processes.find(p => p.numero_causa === escrito.numero_causa)?.id}`, '_blank')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-xs whitespace-nowrap"
                          >
                            Ver Expediente
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
