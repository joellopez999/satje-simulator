'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Scale,
  Users,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  Plus,
  X,
  Paperclip,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { getProcesses } from '@/lib/storage'
import { useUser } from '@/app/providers'

export default function ProcesoDetailPage() {
  const params = useParams()
  const [proceso, setProceso] = useState<any>(null)
  const [expandedExpedientes, setExpandedExpedientes] = useState<string[]>([])
  const [expandedActividades, setExpandedActividades] = useState<string[]>([])
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [selectedActivityFiles, setSelectedActivityFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    const loadProcess = async () => {
      if (params.id) {
        try {
          const response = await fetch('/api/processes/search')
          if (!response.ok) throw new Error('Error fetching processes')
          const procesos = await response.json()
          const procesoEncontrado = procesos.find((p: any) => p.id === params.id)
          setProceso(procesoEncontrado)
        } catch (error) {
          console.error('Error loading process:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    loadProcess()
  }, [params.id])

  const toggleExpediente = (expedienteId: string) => {
    setExpandedExpedientes(prev =>
      prev.includes(expedienteId)
        ? prev.filter(id => id !== expedienteId)
        : [...prev, expedienteId]
    )
  }

  const toggleActividad = (actividadId: string) => {
    setExpandedActividades(prev =>
      prev.includes(actividadId)
        ? prev.filter(id => id !== actividadId)
        : [...prev, actividadId]
    )
  }

  const handleViewFiles = (actividad: any) => {
    const files = []
    if (actividad.archivo_url) {
      // Si es base64, extraer información del archivo
      if (actividad.archivo_url.startsWith('data:')) {
        const fileName = actividad.metadata?.archivo_info?.nombre || 'archivo.pdf'
        const fileSize = actividad.metadata?.archivo_info?.tamaño ?
          `${(actividad.metadata.archivo_info.tamaño / 1024 / 1024).toFixed(2)} MB` : 'N/A'
        const fileType = actividad.metadata?.archivo_info?.tipo || 'application/pdf'

        files.push({
          id: 1,
          name: fileName,
          url: actividad.archivo_url,
          type: fileType,
          size: fileSize,
          isBase64: true
        })
      } else {
        // Si es URL normal
        files.push({
          id: 1,
          name: actividad.archivo_url.split('/').pop() || 'archivo.pdf',
          url: actividad.archivo_url,
          type: 'pdf',
          size: actividad.metadata?.archivo_info?.size ? `${(actividad.metadata.archivo_info.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
          isBase64: false
        })
      }
    }
    setSelectedActivityFiles(files)
    setShowFilesModal(true)
  }

  const handleDownloadFile = (file: any) => {
    if (file.isBase64) {
      // Descargar archivo base64
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Descargar archivo normal
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleViewFile = (file: any) => {
    if (file.isBase64) {
      // Abrir archivo base64 en nueva ventana
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${file.name}</title></head>
            <body style="margin:0; padding:20px;">
              <h2>${file.name}</h2>
              <p>Tamaño: ${file.size}</p>
              <iframe src="${file.url}" width="100%" height="600px" style="border:none;"></iframe>
            </body>
          </html>
        `)
        newWindow.document.close()
      }
    } else {
      // Abrir archivo normal
      window.open(file.url, '_blank')
    }
  }

  const handleDeleteActivity = async (actividadId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta actividad? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch('/api/activities/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actividadId,
          userId: user?.id
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar la actividad')
      }

      alert('Actividad eliminada exitosamente')

      // Recargar el proceso
      const refreshResponse = await fetch(`/api/processes/search?t=${Date.now()}`, { cache: 'no-store' })
      if (!refreshResponse.ok) throw new Error('Error fetching processes')
      const procesos = await refreshResponse.json()
      const procesoEncontrado = procesos.find((p: any) => p.id === params.id)
      setProceso(procesoEncontrado)

    } catch (error: any) {
      console.error('Error deleting activity:', error)
      alert(error.message || 'Error al eliminar la actividad')
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'providencia':
        return <Scale className="h-4 w-4 text-blue-600" />
      case 'escrito':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'razon':
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'providencia':
        return 'bg-blue-100 text-blue-800'
      case 'escrito':
        return 'bg-green-100 text-green-800'
      case 'razon':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!proceso) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        {user && <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />}

        <div className="flex">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <div className="flex-1 lg:ml-64 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Proceso no encontrado</h1>
                <p className="text-gray-600 mb-6">
                  El proceso con ID "{params.id}" no existe o ha sido eliminado.
                </p>
                <a
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la búsqueda
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {user && <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />}

      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <a
                    href="/"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </a>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {proceso.numero_causa}
                    </h1>
                    <p className="text-gray-600">
                      {proceso.materia} • {proceso.lugar}
                    </p>
                  </div>
                </div>

                {/* Botón de Nueva Búsqueda */}
                <a
                  href="/"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <Search className="h-4 w-4" />
                  Nueva Búsqueda
                </a>
              </div>
            </div>

            {/* Información del Proceso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del Proceso</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Partes del Proceso</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Actor/Accionante</label>
                      <p className="text-gray-900">{proceso.actor}</p>
                      {proceso.cedula_actor && (
                        <p className="text-sm text-gray-600">Cédula: {proceso.cedula_actor}</p>
                      )}
                      {proceso.abogado_actor && (
                        <p className="text-sm text-gray-600">Abogado: {proceso.abogado_actor}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Demandado/Accionado</label>
                      <p className="text-gray-900">{proceso.demandado}</p>
                      {proceso.cedula_demandado && (
                        <p className="text-sm text-gray-600">Cédula: {proceso.cedula_demandado}</p>
                      )}
                      {proceso.abogado_demandado && (
                        <p className="text-sm text-gray-600">Abogado: {proceso.abogado_demandado}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Detalles del Proceso</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Asunto</label>
                      <p className="text-gray-900">{proceso.asunto}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado</label>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${proceso.estado === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : proceso.estado === 'acumulado'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {proceso.estado}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                      <p className="text-gray-900">
                        {new Date(proceso.fecha_creacion).toLocaleDateString('es-EC', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expedientes */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Expedientes</h2>

              {proceso.expedientes && proceso.expedientes.length > 0 ? (
                proceso.expedientes.map((expediente: any) => (
                  <div key={expediente.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <button
                        onClick={() => toggleExpediente(expediente.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Expediente {expediente.numero_expediente} - {expediente.instancia === 'primera' ? 'PRIMER NIVEL' : expediente.instancia === 'segunda' ? 'SEGUNDO NIVEL' : 'TERCER NIVEL'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {expediente.actividades?.length || 0} actividades
                            </p>
                          </div>
                        </div>
                        {expandedExpedientes.includes(expediente.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {expandedExpedientes.includes(expediente.id) && (
                      <div className="border-t border-gray-200 p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Actividades</h4>

                        {expediente.actividades && expediente.actividades.length > 0 ? (
                          <div className="space-y-4">
                            {expediente.actividades
                              .sort((a: any, b: any) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
                              .map((actividad: any) => (
                                <div key={actividad.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <button
                                      onClick={() => toggleActividad(actividad.id)}
                                      className="flex-1 flex items-center justify-between text-left"
                                    >
                                      <div className="flex items-center gap-3">
                                        {getTipoIcon(actividad.tipo)}
                                        <div>
                                          <h5 className="font-medium text-gray-900">
                                            {actividad.tipo === 'escrito' ? 'Escrito' :
                                              actividad.tipo === 'providencia' ? 'Providencia' :
                                                actividad.tipo === 'razon' ? 'Razón' :
                                                  actividad.tipo === 'oficio' ? 'Oficio' :
                                                    actividad.tipo === 'notificacion' ? 'Notificación' :
                                                      actividad.tipo === 'tercero' ? 'Escrito de Tercero' :
                                                        actividad.tipo}
                                          </h5>
                                          <p className="text-sm text-gray-600">
                                            {new Date(actividad.fecha_creacion).toLocaleString('es-EC')}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(actividad.tipo)}`}>
                                          {actividad.tipo}
                                        </span>
                                        {expandedActividades.includes(actividad.id) ? (
                                          <ChevronDown className="h-4 w-4 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                    </button>

                                    {user?.role === 'admin' && (
                                      <button
                                        onClick={() => handleDeleteActivity(actividad.id)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                        title="Eliminar actividad"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>

                                  {expandedActividades.includes(actividad.id) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      {/* Información Adicional (Metadata) - Moved to top */}
                                      {actividad.metadata && (
                                        <div className="mb-4">
                                          <label className="text-sm font-medium text-gray-600">Información Adicional</label>
                                          <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                                            {/* Información del usuario creador */}
                                            <div className="text-sm mb-3 pb-3 border-b border-blue-200">
                                              <p><strong>Creado por:</strong> {actividad.metadata.usuario_creador?.nombre || 'Desconocido'}</p>
                                              {actividad.metadata.usuario_creador?.rol && (
                                                <p><strong>Rol:</strong> {actividad.metadata.usuario_creador.rol}</p>
                                              )}
                                              {actividad.metadata.usuario_creador?.email && (
                                                <p><strong>Email:</strong> {actividad.metadata.usuario_creador.email}</p>
                                              )}
                                            </div>

                                            {/* Título personalizado */}
                                            {actividad.titulo && (
                                              <div className="text-sm mb-3 pb-3 border-b border-blue-200">
                                                <p><strong>Título:</strong> {actividad.titulo}</p>
                                              </div>
                                            )}

                                            {/* Información específica de terceros */}
                                            {actividad.metadata.es_tercero && (
                                              <div className="text-sm">
                                                <p><strong>Tipo de tercero:</strong> {actividad.metadata.tipo_tercero}</p>
                                                <p><strong>Nombre:</strong> {actividad.metadata.nombre_tercero}</p>
                                                <p><strong>Cédula:</strong> {actividad.metadata.cedula_tercero}</p>
                                              </div>
                                            )}

                                            {/* Información específica de providencias */}
                                            {actividad.metadata.tipo_providencia && (
                                              <div className="text-sm">
                                                <p><strong>Tipo de providencia:</strong> {actividad.metadata.tipo_providencia}</p>
                                              </div>
                                            )}

                                            {/* Información específica de actuaciones de secretaría */}
                                            {actividad.metadata.tipo_actuacion && (
                                              <div className="text-sm">
                                                <p><strong>Tipo de actuación:</strong> {actividad.metadata.tipo_actuacion}</p>
                                              </div>
                                            )}

                                            {/* Información específica de escritos de abogados */}
                                            {actividad.metadata.tipo_petitorio && (
                                              <div className="text-sm">
                                                <p><strong>Tipo de petitorio:</strong> {actividad.metadata.tipo_petitorio}</p>
                                                <p><strong>Calidad:</strong> {actividad.metadata.calidad}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Fallback for Creado por if no metadata */}
                                      {!actividad.metadata && (
                                        <div className="mb-4">
                                          <label className="text-sm font-medium text-gray-600">Creado por</label>
                                          <p className="text-gray-900">{actividad.creado_por}</p>
                                        </div>
                                      )}

                                      {/* Contenido - Moved after metadata */}
                                      <div className="mb-4">
                                        <label className="text-sm font-medium text-gray-600">Contenido</label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                          <p className="text-gray-900 whitespace-pre-wrap">{actividad.contenido}</p>
                                        </div>
                                      </div>

                                      {actividad.archivo_url && (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleViewFiles(actividad)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                                          >
                                            <Eye className="h-4 w-4" />
                                            Ver Archivos
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No hay actividades en este expediente</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No hay expedientes para este proceso</p>
                </div>
              )}
            </div>
          </div>
        </div >
      </div >

      {/* Modal de Archivos */}
      {
        showFilesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Archivos Adjuntos
                  </h3>
                  <button
                    onClick={() => setShowFilesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {selectedActivityFiles.length > 0 ? (
                  <div className="space-y-4">
                    {selectedActivityFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewFile(file)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Descargar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay archivos adjuntos</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}