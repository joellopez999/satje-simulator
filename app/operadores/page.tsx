'use client'

import { useState, useEffect } from 'react'
import { Inbox, FileText, Clock, AlertCircle, CheckCircle, Plus, Eye, CheckSquare, RefreshCw, Calendar } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { getProcesses, createActivity } from '@/lib/simple-storage'

export default function OperadoresPage() {
  const [activeTab, setActiveTab] = useState('buzon')
  const [processes, setProcesses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showProvidenciaForm, setShowProvidenciaForm] = useState(false)
  const [selectedEscrito, setSelectedEscrito] = useState<any>(null)
  const [providenciaData, setProvidenciaData] = useState({
    tipo: '',
    titulo: '',
    contenido: '',
    solicitar_secretaria: false,
    solicitud_secretaria: ''
  })
  const [showHistoric, setShowHistoric] = useState(false)

  useEffect(() => {
    const loadProcesses = () => {
      try {
        const allProcesses = getProcesses()
        setProcesses(allProcesses)
      } catch (error) {
        console.error('Error loading processes:', error)
        setProcesses([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProcesses()

    // Actualizar cuando se regrese a la pestaña
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProcesses()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Generar escritos pendientes basados en procesos reales
  const escritosPendientes = processes.flatMap(process =>
    process.expedientes?.flatMap((expediente: any) =>
      expediente.actividades
        ?.filter((actividad: any) => actividad.tipo === 'escrito' && !actividad.despachado)
        ?.map((actividad: any) => ({
          id: actividad.id,
          numero_causa: process.numero_causa,
          actor: process.actor,
          demandado: process.demandado,
          titulo: actividad.titulo,
          fecha_escrito: actividad.fecha_creacion,
          dias_pendiente: Math.floor((Date.now() - new Date(actividad.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24)),
          estado: Math.floor((Date.now() - new Date(actividad.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'vencido' : 
                  Math.floor((Date.now() - new Date(actividad.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24)) > 3 ? 'urgente' : 'normal',
          contenido: actividad.contenido,
          expediente_id: expediente.id,
          despachado: actividad.despachado || false,
          fecha_despacho: actividad.fecha_despacho,
          despachado_por: actividad.despachado_por,
          // Información del usuario creador
          creado_por: actividad.creado_por,
          usuario_creador: actividad.metadata?.usuario_creador || null,
          tipo_petitorio: actividad.metadata?.tipo_petitorio || 'Escrito'
        })) || []
    ) || []
  ).filter(Boolean)

  // Generar escritos despachados recientemente (últimos 7 días)
  const escritosDespachados = processes.flatMap(process => 
    process.expedientes?.flatMap((expediente: any) => 
      expediente.actividades
        ?.filter((actividad: any) => 
          actividad.tipo === 'escrito' && 
          actividad.despachado && 
          actividad.fecha_despacho &&
          (Date.now() - new Date(actividad.fecha_despacho).getTime()) < (7 * 24 * 60 * 60 * 1000)
        )
        ?.map((actividad: any) => ({
          id: actividad.id,
          numero_causa: process.numero_causa,
          actor: process.actor,
          demandado: process.demandado,
          titulo: actividad.titulo,
          fecha_escrito: actividad.fecha_creacion,
          fecha_despacho: actividad.fecha_despacho,
          despachado_por: actividad.despachado_por,
          contenido: actividad.contenido,
          expediente_id: expediente.id,
          // Información del usuario creador
          creado_por: actividad.creado_por,
          usuario_creador: actividad.metadata?.usuario_creador || null,
          tipo_petitorio: actividad.metadata?.tipo_petitorio || 'Escrito'
        })) || []
    ) || []
  ).filter(Boolean).sort((a, b) => new Date(b.fecha_despacho).getTime() - new Date(a.fecha_despacho).getTime())

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'normal':
        return 'bg-green-100 text-green-800'
      case 'urgente':
        return 'bg-yellow-100 text-yellow-800'
      case 'vencido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'normal':
        return <CheckCircle className="h-4 w-4" />
      case 'urgente':
        return <Clock className="h-4 w-4" />
      case 'vencido':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleCrearProvidencia = (escrito: any) => {
    setSelectedEscrito(escrito)
    setShowProvidenciaForm(true)
    setProvidenciaData({
      tipo: '',
      titulo: `Providencia sobre ${escrito.titulo}`,
      contenido: '',
      solicitar_secretaria: false,
      solicitud_secretaria: ''
    })
  }

  const handleSubmitProvidencia = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedEscrito || !providenciaData.tipo || !providenciaData.contenido) {
      alert('Por favor complete todos los campos')
      return
    }

    if (providenciaData.solicitar_secretaria && !providenciaData.solicitud_secretaria) {
      alert('Por favor complete las instrucciones para la secretaría')
      return
    }

    // Confirmación de seguridad
    const confirmMessage = providenciaData.solicitar_secretaria 
      ? `¿Está seguro de que desea crear esta providencia?\n\nTipo: ${providenciaData.tipo}\nTítulo: ${providenciaData.titulo}\n\nSe solicitará actividad a secretaría: ${providenciaData.solicitud_secretaria}\n\nEsta acción creará la providencia y marcará el escrito como despachado.`
      : `¿Está seguro de que desea crear esta providencia?\n\nTipo: ${providenciaData.tipo}\nTítulo: ${providenciaData.titulo}\n\nEsta acción creará la providencia y marcará el escrito como despachado.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      // Crear la providencia
      const newProvidencia = createActivity({
        expediente_id: selectedEscrito.expediente_id,
        tipo: 'providencia',
        titulo: providenciaData.titulo,
        contenido: providenciaData.contenido,
        creado_por: 'Juez del Sistema',
        metadata: {
          tipo_providencia: providenciaData.tipo,
          escrito_relacionado: selectedEscrito.id,
          numero_causa: selectedEscrito.numero_causa
        }
      })

      // Marcar el escrito como despachado
      const allProcesses = getProcesses()
      const processIndex = allProcesses.findIndex(p => p.expedientes?.some(e => e.id === selectedEscrito.expediente_id))
      
      if (processIndex !== -1) {
        const expedienteIndex = allProcesses[processIndex].expedientes!.findIndex(e => e.id === selectedEscrito.expediente_id)
        
        if (expedienteIndex !== -1) {
          const actividadIndex = allProcesses[processIndex].expedientes![expedienteIndex].actividades.findIndex(a => a.id === selectedEscrito.id)
          
          if (actividadIndex !== -1) {
            // Marcar como despachado
            allProcesses[processIndex].expedientes![expedienteIndex].actividades[actividadIndex].despachado = true
            allProcesses[processIndex].expedientes![expedienteIndex].actividades[actividadIndex].fecha_despacho = new Date().toISOString()
            allProcesses[processIndex].expedientes![expedienteIndex].actividades[actividadIndex].despachado_por = 'Juez del Sistema'
            
            // Guardar cambios
            localStorage.setItem('satje_processes', JSON.stringify(allProcesses))
          }
        }
      }

      // Si se solicita actividad a secretaría, crear la solicitud
      if (providenciaData.solicitar_secretaria) {
        const solicitudSecretaria = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          providencia_id: newProvidencia.id,
          proceso_id: allProcesses[processIndex].id,
          expediente_id: selectedEscrito.expediente_id,
          numero_causa: selectedEscrito.numero_causa,
          instrucciones: providenciaData.solicitud_secretaria,
          estado: 'pendiente',
          fecha_solicitud: new Date().toISOString(),
          solicitado_por: 'Juez del Sistema',
          solicitado_por_id: 'juez-sistema',
          titulo_providencia: providenciaData.titulo,
          escrito_id: selectedEscrito.id
        }

        // Guardar solicitud en localStorage
        const existingSolicitudes = JSON.parse(localStorage.getItem('satje_solicitudes_secretaria') || '[]')
        existingSolicitudes.push(solicitudSecretaria)
        localStorage.setItem('satje_solicitudes_secretaria', JSON.stringify(existingSolicitudes))
      }

      console.log('Providencia creada:', newProvidencia)
      const successMessage = providenciaData.solicitar_secretaria 
        ? 'Providencia creada exitosamente, escrito marcado como despachado y solicitud enviada a secretaría'
        : 'Providencia creada exitosamente y escrito marcado como despachado'
      alert(successMessage)
      
      setShowProvidenciaForm(false)
      setSelectedEscrito(null)
      setProvidenciaData({ 
        tipo: '', 
        titulo: '', 
        contenido: '', 
        solicitar_secretaria: false, 
        solicitud_secretaria: '' 
      })
      
      // Recargar procesos para actualizar la vista
      const updatedProcesses = getProcesses()
      setProcesses(updatedProcesses)
    } catch (error) {
      console.error('Error al crear providencia:', error)
      alert('Error al crear la providencia')
    }
  }

  const handleMarcarDespachado = (escrito: any) => {
    if (confirm(`¿Está seguro de marcar como despachado el escrito "${escrito.titulo}"?`)) {
      try {
        // Marcar el escrito como despachado
        const allProcesses = getProcesses()
        const processIndex = allProcesses.findIndex(p => p.expedientes?.some(e => e.id === escrito.expediente_id))
        
        if (processIndex !== -1) {
          const expedienteIndex = allProcesses[processIndex].expedientes!.findIndex(e => e.id === escrito.expediente_id)
          
          if (expedienteIndex !== -1) {
            const actividadIndex = allProcesses[processIndex].expedientes![expedienteIndex].actividades.findIndex(a => a.id === escrito.id)
            
            if (actividadIndex !== -1) {
              // Marcar como despachado
              allProcesses[processIndex].expedientes![expedienteIndex].actividades[actividadIndex].despachado = true
              allProcesses[processIndex].expedientes![expedienteIndex].actividades[actividadIndex].fecha_despacho = new Date().toISOString()
              allProcesses[processIndex].expedientes![expedienteIndex].actividades[actividadIndex].despachado_por = 'Juez del Sistema'
              
              // Guardar cambios
              localStorage.setItem('satje_processes', JSON.stringify(allProcesses))
              
              // Recargar procesos para actualizar la vista
              const updatedProcesses = getProcesses()
              setProcesses(updatedProcesses)
              
              alert('Escrito marcado como despachado')
            }
          }
        }
      } catch (error) {
        console.error('Error al marcar como despachado:', error)
        alert('Error al marcar como despachado')
      }
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
        <div className="flex-1 ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Inbox className="h-8 w-8 text-blue-600" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    Buzón de Despacho
                  </h1>
                </div>
                <button
                  onClick={() => {
                    const allProcesses = getProcesses()
                    setProcesses(allProcesses)
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar
                </button>
                <button
                  onClick={() => setShowHistoric(!showHistoric)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {showHistoric ? 'Ver Recientes' : 'Ver Histórico'}
                </button>
              </div>
              <p className="text-gray-600">
                Gestione los escritos pendientes de despacho judicial
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Escritos</p>
                    <p className="text-2xl font-bold text-gray-900">{escritosPendientes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Normales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {escritosPendientes.filter(e => e.estado === 'normal').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {escritosPendientes.filter(e => e.estado === 'urgente').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vencidos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {escritosPendientes.filter(e => e.estado === 'vencido').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escritos Pendientes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Escritos Pendientes de Despacho</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {escritosPendientes.map((escrito) => (
                  <div key={escrito.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {escrito.titulo}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getEstadoColor(escrito.estado)}`}>
                            {getEstadoIcon(escrito.estado)}
                            {escrito.estado === 'normal' ? 'Normal' : escrito.estado === 'urgente' ? 'Urgente' : 'Vencido'}
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
                              <span className="font-medium">Días pendiente:</span> {escrito.dias_pendiente} días
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Fecha del escrito:</span> {new Date(escrito.fecha_escrito).toLocaleDateString('es-EC')}
                        </p>
                        
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
                              <p className="text-blue-800">
                                <span className="font-medium">Tipo de Petitorio:</span> {escrito.tipo_petitorio}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {escrito.contenido}
                        </p>
                      </div>
                      
                      <div className="ml-6 flex flex-col gap-2">
                        <button 
                          onClick={() => alert(`Escrito: ${escrito.titulo}\nContenido: ${escrito.contenido}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Escrito
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`¿Está seguro de que desea crear una providencia para el escrito "${escrito.titulo}"?\n\nProceso: ${escrito.numero_causa}\nFecha: ${new Date(escrito.fecha_escrito).toLocaleDateString('es-EC')}`)) {
                              handleCrearProvidencia(escrito)
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Crear Providencia
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`¿Está seguro de que desea marcar como despachado el escrito "${escrito.titulo}"?\n\nProceso: ${escrito.numero_causa}\nEsta acción no se puede deshacer.`)) {
                              handleMarcarDespachado(escrito)
                            }
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
                        >
                          <CheckSquare className="h-4 w-4" />
                          Marcar Despachado
                        </button>
                        <button 
                          onClick={() => window.open(`/proceso/${processes.find(p => p.numero_causa === escrito.numero_causa)?.id}`, '_blank')}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                        >
                          Ver Expediente
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escritos Despachados Recientemente */}
            {escritosDespachados.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Escritos Despachados Recientemente</h3>
                  <p className="text-sm text-gray-600">Últimos 7 días</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {escritosDespachados.map((escrito) => (
                    <div key={escrito.id} className="p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Despachado
                            </span>
                            <h4 className="font-semibold text-gray-900">{escrito.titulo}</h4>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Causa:</strong> {escrito.numero_causa}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Actor:</strong> {escrito.actor} | <strong>Demandado:</strong> {escrito.demandado}
                          </p>
                          
                          {/* Información del usuario creador */}
                          {escrito.usuario_creador && (
                            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                              <p className="text-blue-800">
                                <span className="font-medium">Creado por:</span> {escrito.usuario_creador.nombre} ({escrito.usuario_creador.rol}) | 
                                <span className="font-medium"> Email:</span> {escrito.usuario_creador.email}
                              </p>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500">
                            Escrito: {new Date(escrito.fecha_escrito).toLocaleDateString('es-EC')} | 
                            Despachado: {new Date(escrito.fecha_despacho).toLocaleDateString('es-EC')} por {escrito.despachado_por}
                          </p>
                        </div>
                        
                        <div className="ml-6 flex flex-col gap-2">
                          <button 
                            onClick={() => alert(`Escrito: ${escrito.titulo}\nContenido: ${escrito.contenido}`)}
                            className="btn-secondary text-sm flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver Escrito
                          </button>
                          <button 
                            onClick={() => window.open(`/proceso/${processes.find(p => p.numero_causa === escrito.numero_causa)?.id}`, '_blank')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                          >
                            Ver Expediente
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Providencia */}
      {showProvidenciaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Crear Providencia
                </h3>
                <button
                  onClick={() => setShowProvidenciaForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {selectedEscrito && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Escrito Relacionado</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Proceso:</strong> {selectedEscrito.numero_causa}<br/>
                    <strong>Título:</strong> {selectedEscrito.titulo}<br/>
                    <strong>Fecha:</strong> {new Date(selectedEscrito.fecha_escrito).toLocaleDateString('es-EC')}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitProvidencia} className="space-y-4">
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Providencia *
                  </label>
                  <select
                    id="tipo"
                    value={providenciaData.tipo}
                    onChange={(e) => setProvidenciaData(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="auto_admision">Auto de Admisión</option>
                    <option value="auto_inadmision">Auto de Inadmisión</option>
                    <option value="auto_tramite">Auto de Trámite</option>
                    <option value="sentencia">Sentencia</option>
                    <option value="resolucion">Resolución</option>
                    <option value="providencia">Providencia</option>
                    <option value="decreto">Decreto</option>
                    <option value="oficio">Oficio</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la Providencia *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    value={providenciaData.titulo}
                    onChange={(e) => setProvidenciaData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido de la Providencia *
                  </label>
                  <textarea
                    id="contenido"
                    value={providenciaData.contenido}
                    onChange={(e) => setProvidenciaData(prev => ({ ...prev, contenido: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Escriba el contenido de la providencia..."
                    required
                  />
                </div>

                {/* Sección de Solicitud a Secretaría */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="solicitar_secretaria"
                      checked={providenciaData.solicitar_secretaria}
                      onChange={(e) => setProvidenciaData(prev => ({ 
                        ...prev, 
                        solicitar_secretaria: e.target.checked,
                        solicitud_secretaria: e.target.checked ? prev.solicitud_secretaria : ''
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="solicitar_secretaria" className="text-sm font-medium text-gray-700">
                      Solicitar actividad a Secretaría
                    </label>
                  </div>

                  {providenciaData.solicitar_secretaria && (
                    <div>
                      <label htmlFor="solicitud_secretaria" className="block text-sm font-medium text-gray-700 mb-2">
                        Instrucciones para Secretaría *
                      </label>
                      <textarea
                        id="solicitud_secretaria"
                        value={providenciaData.solicitud_secretaria}
                        onChange={(e) => setProvidenciaData(prev => ({ ...prev, solicitud_secretaria: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Especifique qué actividad debe realizar la secretaría..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Desarrolle las instrucciones de manera clara y específica para la secretaría
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Providencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProvidenciaForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}