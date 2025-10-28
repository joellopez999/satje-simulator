'use client'

import { useState, useEffect } from 'react'
import { Search, Upload, FileText, Save, Plus, X } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { useUser } from '@/app/providers'
import { getProcesses, searchProcesses } from '@/lib/storage'
import { uploadFileToSupabase, validateFile } from '@/lib/supabase-storage-utils'
import { notifyNuevaActividad } from '@/lib/telegram-notifications'

export default function EscritosPage() {
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProcess, setSelectedProcess] = useState<any>(null)
  const [selectedExpediente, setSelectedExpediente] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [escritoData, setEscritoData] = useState({
    titulo: '',
    tipo_petitorio: '',
    contenido: '',
    calidad: '',
    archivo: null as File | null
  })

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchTerm.length >= 3) {
      const results = searchProcesses({
        numero_causa: searchTerm
      })
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  // Cerrar dropdown al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-dropdown')) {
        setSearchResults([])
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const calidades = [
    'Actor/Accionante/Denunciante/Legitimado Activo',
    'Demandado/Accionado/Procesado/Legitimado Pasivo'
  ]

  const tiposPetitorio = [
    'Escrito',
    'Oficio',
    'Anexos'
  ]

  const handleProcessSelect = (proceso: any) => {
    setSelectedProcess(proceso)
    setSearchTerm(proceso.numero_causa)
    setSearchResults([])
    setSelectedExpediente(null)
    setShowCreateForm(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setEscritoData({...escritoData, archivo: file})
    } else {
      alert('Solo se permiten archivos PDF')
    }
  }

  const handleSubmitEscrito = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Confirmación de seguridad
    if (!confirm(`¿Está seguro de que desea enviar este escrito?\n\nTipo: ${escritoData.tipo_petitorio}\nTítulo: ${escritoData.titulo}\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      // Crear la nueva actividad
      let archivoUrl = undefined
      if (escritoData.archivo) {
        // Convertir archivo a base64 para almacenamiento local
        try {
          archivoUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(escritoData.archivo!)
          })
        } catch (error) {
          console.error('Error al procesar archivo:', error)
          alert('Error al procesar el archivo. Intente nuevamente.')
          setIsSubmitting(false)
          return
        }
      }

      const nuevaActividad = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        expediente_id: selectedExpediente.id,
        tipo: 'escrito' as const,
        titulo: escritoData.titulo,
        contenido: escritoData.contenido,
        archivo_url: archivoUrl,
        creado_por: user?.name || 'Usuario',
        fecha_creacion: new Date().toISOString(),
        metadata: {
          tipo_petitorio: escritoData.tipo_petitorio,
          calidad: escritoData.calidad,
          proceso_id: selectedProcess.id,
          usuario_creador: {
            id: user?.id || 'unknown',
            nombre: user?.name || 'Abogado',
            email: user?.email || 'abogado@satje.com',
            rol: user?.role || 'abogado'
          },
          archivo_info: escritoData.archivo ? {
            nombre: escritoData.archivo.name,
            tamaño: escritoData.archivo.size,
            tipo: escritoData.archivo.type,
            fecha_subida: new Date().toISOString()
          } : null
        }
      }

      // Obtener todos los procesos
      const procesos = getProcesses()
      
      // Encontrar el proceso y expediente correspondiente
      const procesoIndex = procesos.findIndex(p => p.id === selectedProcess.id)
      if (procesoIndex === -1) {
        throw new Error('Proceso no encontrado')
      }

      const expedienteIndex = procesos[procesoIndex].expedientes?.findIndex(
        e => e.id === selectedExpediente.id
      )
      if (expedienteIndex === -1 || expedienteIndex === undefined || !procesos[procesoIndex].expedientes) {
        throw new Error('Expediente no encontrado')
      }

      // Agregar la actividad al expediente
      procesos[procesoIndex].expedientes[expedienteIndex].actividades.push(nuevaActividad)
      
      // Actualizar la fecha de actualización del proceso
      procesos[procesoIndex].fecha_actualizacion = new Date().toISOString()

      // Guardar en localStorage
      localStorage.setItem('satje_processes', JSON.stringify(procesos))
      
      console.log('Escrito guardado exitosamente:', nuevaActividad)
      alert(`${escritoData.tipo_petitorio} guardado exitosamente`)
      
      // Enviar notificación de Telegram al juez
      try {
        await notifyNuevaActividad({
          titulo: escritoData.titulo,
          contenido: escritoData.contenido,
          usuario: user?.name || 'Abogado',
          proceso_id: selectedProcess.id,
          expediente_id: selectedExpediente.id
        }, {
          chatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || ''
        })
        console.log('Notificación de Telegram enviada al juez')
      } catch (error) {
        console.error('Error enviando notificación de Telegram:', error)
        // No mostrar error al usuario, solo log
      }
      
      setIsSubmitting(false)
      setShowCreateForm(false)
      setEscritoData({ titulo: '', tipo_petitorio: '', contenido: '', calidad: '', archivo: null })
      
    } catch (error) {
      console.error('Error al guardar escrito:', error)
      alert('Error al guardar el escrito')
      setIsSubmitting(false)
    }
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
              <h1 className="text-3xl font-bold text-judicial-900 mb-2">
                Ingreso de Escritos
              </h1>
              <p className="text-judicial-600">
                Ingrese escritos y documentos para los procesos judiciales
              </p>
            </div>

            {/* Búsqueda de Proceso */}
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-judicial-900">
                  Seleccionar Proceso
                </h2>
              </div>
              
              <div className="relative search-dropdown">
                <input
                  type="text"
                  placeholder="Buscar por número de causa (ej: 13999-2025-00123)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full"
                />
                
                {/* Resultados de búsqueda en tiempo real */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-judicial-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((proceso) => (
                      <div
                        key={proceso.id}
                        onClick={() => handleProcessSelect(proceso)}
                        className="p-3 hover:bg-judicial-50 cursor-pointer border-b border-judicial-100 last:border-b-0"
                      >
                        <div className="font-medium text-judicial-900">{proceso.numero_causa}</div>
                        <div className="text-sm text-judicial-600">{proceso.asunto}</div>
                        <div className="text-xs text-judicial-500">
                          {proceso.actor} vs {proceso.demandado}
                        </div>
                        <div className="text-xs text-judicial-400">
                          Iniciado: {new Date(proceso.fecha_creacion).toLocaleDateString('es-EC')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Proceso Seleccionado */}
              {selectedProcess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Proceso Seleccionado</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium text-green-800">Número:</span>
                      <p className="text-green-700">{selectedProcess.numero_causa}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Materia:</span>
                      <p className="text-green-700">{selectedProcess.materia}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Actor:</span>
                      <p className="text-green-700">{selectedProcess.actor}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Demandado:</span>
                      <p className="text-green-700">{selectedProcess.demandado}</p>
                    </div>
              <div>
                <span className="font-medium text-green-800">Fecha de Inicio:</span>
                <p className="text-green-700">
                  {new Date(selectedProcess.fecha_creacion).toLocaleString('es-EC', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </p>
              </div>
                    <div>
                      <span className="font-medium text-green-800">Lugar:</span>
                      <p className="text-green-700">{selectedProcess.lugar}</p>
                    </div>
                  </div>

                  {/* Selección de Expediente (Instancia) */}
                  {selectedProcess.expedientes && selectedProcess.expedientes.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-green-800 mb-2">
                        Seleccionar Instancia:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedProcess.expedientes.map((expediente: any) => (
                          <button
                            key={expediente.id}
                            onClick={() => setSelectedExpediente(expediente)}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              selectedExpediente?.id === expediente.id
                                ? 'border-green-500 bg-green-100 text-green-900'
                                : 'border-green-200 bg-white hover:bg-green-50'
                            }`}
                          >
                            <div className="font-medium">
                              Expediente {expediente.numero_expediente}
                            </div>
                            <div className="text-sm text-green-600">
                              {expediente.instancia === 'primera' && 'Primera Instancia'}
                              {expediente.instancia === 'segunda' && 'Segunda Instancia (Apelación)'}
                              {expediente.instancia === 'tercera' && 'Tercera Instancia (Casación)'}
                            </div>
                            <div className="text-xs text-green-500">
                              {expediente.actividades.length} actividades
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedExpediente && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Ingresar Escrito en {selectedExpediente.instancia === 'primera' ? 'Primera Instancia' : 
                        selectedExpediente.instancia === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Formulario de Escrito */}
            {showCreateForm && selectedProcess && selectedExpediente && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary-600" />
                    <h2 className="text-xl font-semibold text-judicial-900">
                      Nuevo Escrito
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="p-2 text-judicial-400 hover:text-judicial-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitEscrito} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-judicial-700 mb-1">
                        Tipo de Petitorio *
                      </label>
                      <select
                        value={escritoData.tipo_petitorio}
                        onChange={(e) => setEscritoData({...escritoData, tipo_petitorio: e.target.value})}
                        className="input-field"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposPetitorio.map((tipo) => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-judicial-700 mb-1">
                        Calidad en que Comparece *
                      </label>
                      <select
                        value={escritoData.calidad}
                        onChange={(e) => setEscritoData({...escritoData, calidad: e.target.value})}
                        className="input-field"
                        required
                      >
                        <option value="">Seleccionar calidad</option>
                        {calidades.map((calidad) => (
                          <option key={calidad} value={calidad}>{calidad}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Campo de Título */}
                  <div>
                    <label className="block text-sm font-medium text-judicial-700 mb-1">
                      Título del {escritoData.tipo_petitorio || 'Documento'} *
                    </label>
                    <input
                      type="text"
                      value={escritoData.titulo}
                      onChange={(e) => setEscritoData({...escritoData, titulo: e.target.value})}
                      placeholder={`Ingrese el título del ${escritoData.tipo_petitorio || 'documento'}...`}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Opción 1: Contenido de texto */}
                  <div>
                    <label className="block text-sm font-medium text-judicial-700 mb-1">
                      Contenido del {escritoData.tipo_petitorio || 'Documento'}
                    </label>
                    <textarea
                      value={escritoData.contenido}
                      onChange={(e) => setEscritoData({...escritoData, contenido: e.target.value})}
                      placeholder={
                        escritoData.tipo_petitorio === 'Escrito' 
                          ? 'Escriba aquí el contenido del escrito...'
                          : escritoData.tipo_petitorio === 'Oficio'
                          ? 'Escriba aquí el contenido del oficio...'
                          : escritoData.tipo_petitorio === 'Anexos'
                          ? 'Describa los anexos que se adjuntan...'
                          : 'Escriba aquí el contenido del documento...'
                      }
                      className="input-field h-40 resize-none"
                    />
                    <p className="text-xs text-judicial-500 mt-1">
                      Puede escribir directamente el contenido o subir un archivo PDF
                    </p>
                  </div>

                  {/* Opción 2: Subir archivo PDF */}
                  <div>
                    <label className="block text-sm font-medium text-judicial-700 mb-1">
                      Subir Archivo PDF
                    </label>
                    <div className="border-2 border-dashed border-judicial-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-judicial-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-judicial-600 hover:text-primary-600"
                      >
                        {escritoData.archivo ? (
                          <span className="text-green-600 font-medium">
                            {escritoData.archivo.name}
                          </span>
                        ) : (
                          <span>Haga clic para seleccionar un archivo PDF</span>
                        )}
                      </label>
                      <p className="text-xs text-judicial-500 mt-1">
                        Solo se permiten archivos PDF
                      </p>
                    </div>
                  </div>

                  {/* Información del proceso y expediente */}
                  <div className="bg-judicial-50 border border-judicial-200 rounded-lg p-4">
                    <h3 className="font-medium text-judicial-900 mb-2">Proceso y Expediente Destino</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-judicial-700">Proceso:</span>
                        <p className="text-judicial-600">{selectedProcess.numero_causa}</p>
                      </div>
                      <div>
                        <span className="font-medium text-judicial-700">Asunto:</span>
                        <p className="text-judicial-600">{selectedProcess.asunto}</p>
                      </div>
                      <div>
                        <span className="font-medium text-judicial-700">Fecha de Inicio:</span>
                        <p className="text-judicial-600">
                          {new Date(selectedProcess.fecha_creacion).toLocaleDateString('es-EC', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-judicial-700">Expediente:</span>
                        <p className="text-judicial-600">
                          {selectedExpediente.instancia === 'primera' ? 'Primera Instancia' : 
                           selectedExpediente.instancia === 'segunda' ? 'Segunda Instancia (Apelación)' : 
                           'Tercera Instancia (Casación)'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-judicial-700">Actividades existentes:</span>
                        <p className="text-judicial-600">{selectedExpediente.actividades.length}</p>
                      </div>
              <div>
                <span className="font-medium text-judicial-700">Fecha del Expediente:</span>
                <p className="text-judicial-600">
                  {new Date(selectedExpediente.fecha_creacion).toLocaleString('es-EC', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  })}
                </p>
              </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Guardando...' : `Guardar ${escritoData.tipo_petitorio || 'Documento'}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
