'use client'

import { useState, useEffect } from 'react'
import { 
  Inbox, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar,
  Eye,
  CheckSquare,
  RefreshCw,
  Scale,
  Plus,
  Save,
  X
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/app/providers'

export default function BuzonSecretariaPage() {
  const { user } = useUser()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'completadas'>('todas')
  const [searchTerm, setSearchTerm] = useState('')
  const [showActividadForm, setShowActividadForm] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  const [actividadData, setActividadData] = useState({
    tipo_actuacion: '',
    titulo: '',
    contenido: '',
    archivo: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHistoric, setShowHistoric] = useState(false)

  useEffect(() => {
    loadSolicitudes()
  }, [])

  const loadSolicitudes = () => {
    try {
      const storedSolicitudes = JSON.parse(localStorage.getItem('satje_solicitudes_secretaria') || '[]')
      setSolicitudes(storedSolicitudes)
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarcarCompletada = (solicitudId: string) => {
    if (!confirm('¿Está seguro de que desea marcar esta solicitud como completada?\n\nEsta acción no se puede deshacer.')) {
      return
    }

    try {
      const updatedSolicitudes = solicitudes.map(solicitud => {
        if (solicitud.id === solicitudId) {
          return {
            ...solicitud,
            estado: 'completada',
            fecha_completada: new Date().toISOString(),
            completada_por: user?.name || 'Secretario del Sistema'
          }
        }
        return solicitud
      })

      localStorage.setItem('satje_solicitudes_secretaria', JSON.stringify(updatedSolicitudes))
      setSolicitudes(updatedSolicitudes)
      alert('Solicitud marcada como completada exitosamente')
    } catch (error) {
      console.error('Error al marcar solicitud:', error)
      alert('Error al marcar la solicitud')
    }
  }

  const handleCrearActividad = (solicitud: any) => {
    setSelectedSolicitud(solicitud)
    setActividadData({
      tipo_actuacion: '',
      titulo: `Razón sobre ${solicitud.titulo_providencia}`,
      contenido: '',
      archivo: null
    })
    setShowActividadForm(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {
        setActividadData(prev => ({ ...prev, archivo: file }))
      } else {
        alert('Solo se permiten archivos PDF')
      }
    }
  }

  const handleSubmitActividad = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!confirm(`¿Está seguro de que desea crear esta actividad de secretaría?\n\nTipo: ${actividadData.tipo_actuacion}\nTítulo: ${actividadData.titulo}\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      // Procesar archivo si existe
      let archivoBase64 = null
      if (actividadData.archivo) {
        try {
          archivoBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(actividadData.archivo!)
          })
        } catch (error) {
          console.error('Error al procesar archivo:', error)
          alert('Error al procesar el archivo. Intente nuevamente.')
          setIsSubmitting(false)
          return
        }
      }

      // Crear la actividad de secretaría
      const newActividad = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        expediente_id: selectedSolicitud.expediente_id,
        tipo: 'razon',
        titulo: actividadData.titulo,
        contenido: actividadData.contenido,
        fecha_creacion: new Date().toISOString(),
        creado_por: user?.name || 'Secretario del Sistema',
        archivo_url: archivoBase64,
        metadata: {
          tipo_actuacion: actividadData.tipo_actuacion,
          proceso_id: selectedSolicitud.proceso_id,
          solicitud_id: selectedSolicitud.id,
          usuario_creador: {
            id: user?.id || 'secretario-sistema',
            nombre: user?.name || 'Secretario del Sistema',
            email: user?.email || 'secretario@satje.ec',
            rol: user?.role || 'secretario'
          },
          archivo_info: actividadData.archivo ? {
            nombre: actividadData.archivo.name,
            tamaño: actividadData.archivo.size,
            tipo: actividadData.archivo.type,
            fecha_subida: new Date().toISOString()
          } : null
        }
      }

      // Obtener procesos existentes
      const allProcesses = JSON.parse(localStorage.getItem('satje_processes') || '[]')
      const processIndex = allProcesses.findIndex((p: any) => p.id === selectedSolicitud.proceso_id)
      
      if (processIndex !== -1) {
        const expedienteIndex = allProcesses[processIndex].expedientes?.findIndex((e: any) => e.id === selectedSolicitud.expediente_id)
        
        if (expedienteIndex !== -1) {
          // Agregar la actividad al expediente
          allProcesses[processIndex].expedientes[expedienteIndex].actividades.push(newActividad)
          
          // Guardar cambios
          localStorage.setItem('satje_processes', JSON.stringify(allProcesses))
          
          // Marcar la solicitud como completada
          const updatedSolicitudes = solicitudes.map(solicitud => {
            if (solicitud.id === selectedSolicitud.id) {
              return {
                ...solicitud,
                estado: 'completada',
                fecha_completada: new Date().toISOString(),
                completada_por: user?.name || 'Secretario del Sistema',
                actividad_creada: newActividad.id
              }
            }
            return solicitud
          })

          localStorage.setItem('satje_solicitudes_secretaria', JSON.stringify(updatedSolicitudes))
          setSolicitudes(updatedSolicitudes)
        }
      }

      alert('Actividad de secretaría creada exitosamente y solicitud marcada como completada')
      
      setIsSubmitting(false)
      setShowActividadForm(false)
      setSelectedSolicitud(null)
      setActividadData({
        tipo_actuacion: '',
        titulo: '',
        contenido: '',
        archivo: null
      })
      
    } catch (error) {
      console.error('Error al crear actividad:', error)
      alert('Error al crear la actividad')
      setIsSubmitting(false)
    }
  }

  // Filtrar por últimos 7 días
  const sieteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  const solicitudesRecientes = solicitudes.filter(solicitud => {
    const fechaSolicitud = new Date(solicitud.fecha_solicitud)
    return fechaSolicitud >= sieteDiasAtras
  })

  const solicitudesPendientes = solicitudesRecientes.filter(s => s.estado === 'pendiente')
  const solicitudesCompletadas = solicitudesRecientes.filter(s => s.estado === 'completada')

  const filteredSolicitudes = solicitudesRecientes.filter(solicitud => {
    const matchesFilter = filter === 'todas' || solicitud.estado === filter
    const matchesSearch = searchTerm === '' || 
      solicitud.numero_causa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.titulo_providencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitud.instrucciones.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const estadisticas = {
    total: solicitudesRecientes.length,
    pendientes: solicitudesPendientes.length,
    completadas: solicitudesCompletadas.length,
    totalHistoric: solicitudes.length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-judicial-50">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-judicial-50">
      <Sidebar />
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Inbox className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-judicial-900">
              Buzón de Secretaría
            </h1>
          </div>
          <p className="text-judicial-600">
            Gestión de actividades solicitadas por los jueces
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-judicial-900">{estadisticas.total}</p>
                <p className="text-sm text-judicial-600">Últimos 7 días</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-judicial-900">{estadisticas.pendientes}</p>
                <p className="text-sm text-judicial-600">Pendientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-judicial-900">{estadisticas.completadas}</p>
                <p className="text-sm text-judicial-600">Completadas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-judicial-900">{estadisticas.totalHistoric}</p>
                <p className="text-sm text-judicial-600">Total Histórico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por número de causa, título o instrucciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('todas')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'todas' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('pendientes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pendientes' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter('completadas')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completadas' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completadas
              </button>
            </div>
            <button
              onClick={loadSolicitudes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
            <button
              onClick={() => setShowHistoric(!showHistoric)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {showHistoric ? 'Ver Recientes' : 'Ver Histórico'}
            </button>
          </div>
        </div>

        {/* Solicitudes Pendientes */}
        {!showHistoric && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-judicial-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Solicitudes Pendientes ({solicitudesPendientes.length})
            </h2>
            
            {solicitudesPendientes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes pendientes
                </h3>
                <p className="text-gray-600">
                  No hay solicitudes pendientes en los últimos 7 días
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudesPendientes.map((solicitud) => (
              <div key={solicitud.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Scale className="h-5 w-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-judicial-900">
                        {solicitud.titulo_providencia}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        solicitud.estado === 'pendiente' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {solicitud.estado === 'pendiente' ? 'Pendiente' : 'Completada'}
                      </span>
                    </div>
                    <p className="text-sm text-judicial-600 mb-2">
                      <strong>Proceso:</strong> {solicitud.numero_causa}
                    </p>
                    <p className="text-sm text-judicial-600 mb-2">
                      <strong>Solicitado por:</strong> {solicitud.solicitado_por}
                    </p>
                    <p className="text-sm text-judicial-600">
                      <strong>Fecha de solicitud:</strong> {new Date(solicitud.fecha_solicitud).toLocaleString('es-EC')}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Instrucciones:</h4>
                  <p className="text-gray-700">{solicitud.instrucciones}</p>
                </div>

                {solicitud.estado === 'completada' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Completada</span>
                    </div>
                    <p className="text-sm text-green-700">
                      <strong>Completada por:</strong> {solicitud.completada_por}
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Fecha de completado:</strong> {new Date(solicitud.fecha_completada).toLocaleString('es-EC')}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => window.open(`/proceso/${solicitud.proceso_id}`, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Expediente
                  </button>
                  
                  {solicitud.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleCrearActividad(solicitud)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Crear Actividad
                      </button>
                      <button
                        onClick={() => handleMarcarCompletada(solicitud.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Marcar Completada
                      </button>
                    </>
                  )}
                </div>
              </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Solicitudes Completadas */}
        {!showHistoric && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-judicial-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Solicitudes Completadas ({solicitudesCompletadas.length})
            </h2>
            
            {solicitudesCompletadas.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes completadas
                </h3>
                <p className="text-gray-600">
                  No hay solicitudes completadas en los últimos 7 días
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudesCompletadas.map((solicitud) => (
                  <div key={solicitud.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Scale className="h-5 w-5 text-primary-600" />
                          <h3 className="text-lg font-semibold text-judicial-900">
                            {solicitud.titulo_providencia}
                          </h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completada
                          </span>
                        </div>
                        <p className="text-sm text-judicial-600 mb-2">
                          <strong>Proceso:</strong> {solicitud.numero_causa}
                        </p>
                        <p className="text-sm text-judicial-600 mb-2">
                          <strong>Solicitado por:</strong> {solicitud.solicitado_por}
                        </p>
                        <p className="text-sm text-judicial-600">
                          <strong>Fecha de solicitud:</strong> {new Date(solicitud.fecha_solicitud).toLocaleString('es-EC')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Instrucciones:</h4>
                      <p className="text-gray-700">{solicitud.instrucciones}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Completada</span>
                      </div>
                      <p className="text-sm text-green-700">
                        <strong>Completada por:</strong> {solicitud.completada_por}
                      </p>
                      <p className="text-sm text-green-700">
                        <strong>Fecha de completado:</strong> {new Date(solicitud.fecha_completada).toLocaleString('es-EC')}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => window.open(`/proceso/${solicitud.proceso_id}`, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Expediente
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista Histórica */}
        {showHistoric && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-judicial-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Histórico de Solicitudes ({solicitudes.length})
            </h2>
            
            {solicitudes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes históricas
                </h3>
                <p className="text-gray-600">
                  No hay solicitudes registradas en el sistema
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Scale className="h-5 w-5 text-primary-600" />
                          <h3 className="text-lg font-semibold text-judicial-900">
                            {solicitud.titulo_providencia}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            solicitud.estado === 'pendiente' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {solicitud.estado === 'pendiente' ? 'Pendiente' : 'Completada'}
                          </span>
                        </div>
                        <p className="text-sm text-judicial-600 mb-2">
                          <strong>Proceso:</strong> {solicitud.numero_causa}
                        </p>
                        <p className="text-sm text-judicial-600 mb-2">
                          <strong>Solicitado por:</strong> {solicitud.solicitado_por}
                        </p>
                        <p className="text-sm text-judicial-600">
                          <strong>Fecha de solicitud:</strong> {new Date(solicitud.fecha_solicitud).toLocaleString('es-EC')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Instrucciones:</h4>
                      <p className="text-gray-700">{solicitud.instrucciones}</p>
                    </div>

                    {solicitud.estado === 'completada' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Completada</span>
                        </div>
                        <p className="text-sm text-green-700">
                          <strong>Completada por:</strong> {solicitud.completada_por}
                        </p>
                        <p className="text-sm text-green-700">
                          <strong>Fecha de completado:</strong> {new Date(solicitud.fecha_completada).toLocaleString('es-EC')}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => window.open(`/proceso/${solicitud.proceso_id}`, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Expediente
                      </button>
                      
                      {solicitud.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleCrearActividad(solicitud)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Crear Actividad
                          </button>
                          <button
                            onClick={() => handleMarcarCompletada(solicitud.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                          >
                            <CheckSquare className="h-4 w-4" />
                            Marcar Completada
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal para Crear Actividad */}
        {showActividadForm && selectedSolicitud && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Crear Actividad de Secretaría
                </h3>
                <button
                  onClick={() => setShowActividadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Solicitud del Juez:</h4>
                  <p className="text-blue-800 text-sm">
                    <strong>Proceso:</strong> {selectedSolicitud.numero_causa}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Providencia:</strong> {selectedSolicitud.titulo_providencia}
                  </p>
                  <p className="text-blue-800 text-sm">
                    <strong>Instrucciones:</strong> {selectedSolicitud.instrucciones}
                  </p>
                </div>

                <form onSubmit={handleSubmitActividad} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Actuación *
                      </label>
                      <select
                        value={actividadData.tipo_actuacion}
                        onChange={(e) => setActividadData({...actividadData, tipo_actuacion: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="Razón">Razón</option>
                        <option value="Oficio">Oficio</option>
                        <option value="Notificación">Notificación</option>
                        <option value="Citación">Citación</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título de la Actividad *
                      </label>
                      <input
                        type="text"
                        value={actividadData.titulo}
                        onChange={(e) => setActividadData({...actividadData, titulo: e.target.value})}
                        placeholder="Ej: Razón sobre auto de admisión"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contenido de la Actividad *
                    </label>
                    <textarea
                      value={actividadData.contenido}
                      onChange={(e) => setActividadData({...actividadData, contenido: e.target.value})}
                      placeholder="Desarrolle aquí el contenido de la actividad de secretaría..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Desarrolle el contenido de manera clara y detallada
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Archivo Adjunto (Opcional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solo se permiten archivos PDF
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Creando...' : 'Crear Actividad'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowActividadForm(false)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
