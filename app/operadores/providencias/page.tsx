'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Scale, 
  FileText, 
  Plus, 
  Save, 
  X,
  Search,
  Calendar,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { useUser } from '@/app/providers'
import { getPendingWritings, getProcesses, createActivity, markWritingAsDispatched } from '@/lib/storage'
import { uploadFileToSupabase, validateFile } from '@/lib/supabase-storage-utils'

export default function ProvidenciasPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState<'indexada' | 'autonoma'>('indexada')
  const [selectedWriting, setSelectedWriting] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [processSearchTerm, setProcessSearchTerm] = useState('')
  const [processSearchResults, setProcessSearchResults] = useState<any[]>([])
  const [selectedProcessForAutonomous, setSelectedProcessForAutonomous] = useState<any>(null)
  const [selectedExpedienteForAutonomous, setSelectedExpedienteForAutonomous] = useState<any>(null)
  const [selectedInstance, setSelectedInstance] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo_providencia: '',
    proceso_id: '',
    expediente_id: '',
    escrito_vinculado: '',
    archivo: null as File | null,
    solicitar_secretaria: false,
    solicitud_secretaria: ''
  })

  const tiposProvidencia = [
    'Auto de admisión',
    'Auto de inadmisión', 
    'Auto de trámite',
    'Sentencia',
    'Resolución',
    'Providencia',
    'Decreto',
    'Oficio',
    'Otros'
  ]

  const tiposProvidenciaAutonoma = [
    'Auto de oficio',
    'Sentencia',
    'Resolución',
    'Providencia',
    'Decreto',
    'Oficio',
    'Acumulación de procesos',
    'Otros'
  ]

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const results = getPendingWritings().filter(writing =>
        writing.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        writing.proceso.numero_causa.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  // Búsqueda de procesos para providencias autónomas
  useEffect(() => {
    if (processSearchTerm.length >= 3) {
      const processes = getProcesses()
      const results = processes.filter(process => 
        process.numero_causa.toLowerCase().includes(processSearchTerm.toLowerCase()) ||
        process.actor.toLowerCase().includes(processSearchTerm.toLowerCase()) ||
        process.demandado.toLowerCase().includes(processSearchTerm.toLowerCase()) ||
        process.asunto.toLowerCase().includes(processSearchTerm.toLowerCase())
      )
      setProcessSearchResults(results)
    } else {
      setProcessSearchResults([])
    }
  }, [processSearchTerm])

  // Cerrar dropdown al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-dropdown')) {
        setSearchResults([])
        setProcessSearchResults([])
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchResults([])
        setProcessSearchResults([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Procesar parámetros de URL para preseleccionar escrito
  useEffect(() => {
    const escritoId = searchParams.get('escrito_id')
    const procesoId = searchParams.get('proceso_id')
    const expedienteId = searchParams.get('expediente_id')

    if (escritoId && procesoId && expedienteId) {
      // Buscar el escrito en los pendientes
      const writings = getPendingWritings()
      const writing = writings.find(w => w.id === escritoId)
      
      if (writing) {
        setSelectedWriting(writing)
        
        // Generar título con fecha y hora actual
        const now = new Date()
        const fechaHora = now.toLocaleString('es-EC', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        
        setFormData(prev => ({
          ...prev,
          proceso_id: procesoId,
          expediente_id: expedienteId,
          escrito_vinculado: escritoId,
          titulo: `Providencia sobre: ${writing.titulo} - ${fechaHora}`
        }))
        setFormMode('indexada')
        setShowForm(true)
      }
    }
  }, [searchParams])

  const handleModeChange = (mode: 'indexada' | 'autonoma') => {
    setFormMode(mode)
    setSelectedWriting(null)
    setFormData({
      titulo: '',
      contenido: '',
      tipo_providencia: '',
      proceso_id: '',
      expediente_id: '',
      escrito_vinculado: '',
      archivo: null,
      solicitar_secretaria: false,
      solicitud_secretaria: ''
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF')
        e.target.value = ''
        return
      }
      
      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        alert('El archivo no puede ser mayor a 10MB')
        e.target.value = ''
        return
      }
      
      setFormData(prev => ({ ...prev, archivo: file }))
    }
  }

  const handleWritingSelect = (writing: any) => {
    setSelectedWriting(writing)
    
    // Generar título con fecha y hora actual
    const now = new Date()
    const fechaHora = now.toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    setFormData(prev => ({
      ...prev,
      proceso_id: writing.proceso.id,
      expediente_id: writing.expediente.id,
      escrito_vinculado: writing.id,
      titulo: `Providencia sobre: ${writing.titulo} - ${fechaHora}`
    }))
    setSearchResults([])
    setSearchTerm('')
  }

  const handleProcessSelect = (process: any) => {
    setSelectedProcessForAutonomous(process)
    setProcessSearchTerm(process.numero_causa)
    setProcessSearchResults([]) // Close dropdown
    setSelectedExpedienteForAutonomous(null) // Reset expediente when process changes
    setSelectedInstance('') // Reset instance selection
    
    // Generar título con fecha y hora actual
    const now = new Date()
    const fechaHora = now.toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    // Actualizar formData con el proceso seleccionado
    setFormData(prev => ({
      ...prev,
      proceso_id: process.id,
      expediente_id: process.expedientes?.[0]?.id || '',
      titulo: `Providencia de oficio - ${process.numero_causa} - ${fechaHora}`
    }))
  }

  const handleInstanceChange = (instanceId: string) => {
    setSelectedInstance(instanceId)
    if (selectedProcessForAutonomous) {
      const expediente = selectedProcessForAutonomous.expedientes?.find((exp: any) => exp.id === instanceId)
      if (expediente) {
        setFormData(prev => ({
          ...prev,
          expediente_id: expediente.id
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Confirmación de seguridad
    const confirmMessage = formData.solicitar_secretaria 
      ? `¿Está seguro de que desea crear esta providencia?\n\nTipo: ${formData.tipo_providencia}\nTítulo: ${formData.titulo}\n\nSe solicitará actividad a secretaría: ${formData.solicitud_secretaria}\n\nEsta acción no se puede deshacer.`
      : `¿Está seguro de que desea crear esta providencia?\n\nTipo: ${formData.tipo_providencia}\nTítulo: ${formData.titulo}\n\nEsta acción no se puede deshacer.`
    
    if (!confirm(confirmMessage)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      if (!formData.expediente_id || !formData.proceso_id) {
        throw new Error('Debe seleccionar un proceso y expediente válidos.')
      }

      // Procesar archivo si existe
      let archivoBase64 = null
      if (formData.archivo) {
        try {
          archivoBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(formData.archivo!)
          })
        } catch (error) {
          console.error('Error al procesar archivo:', error)
          alert('Error al procesar el archivo. Intente nuevamente.')
          setIsSubmitting(false)
          return
        }
      }

      const actividadData = {
        expediente_id: formData.expediente_id,
        tipo: 'providencia' as const,
        titulo: formData.titulo,
        contenido: formData.contenido,
        archivo_url: archivoBase64 || undefined,
        creado_por: user?.name || 'Usuario',
        fecha_creacion: new Date().toISOString(),
        metadata: {
          tipo_providencia: formData.tipo_providencia,
          modo: formMode,
          escrito_vinculado: formMode === 'indexada' ? formData.escrito_vinculado : null,
          proceso_id: formData.proceso_id,
          usuario_creador: {
            id: user?.id || 'unknown',
            nombre: user?.name || 'Usuario',
            email: user?.email || 'usuario@satje.com',
            rol: user?.role || 'usuario'
          },
          archivo_info: formData.archivo ? {
            nombre: formData.archivo.name,
            tamaño: formData.archivo.size,
            tipo: formData.archivo.type,
            fecha_subida: new Date().toISOString()
          } : null,
          solicitar_secretaria: formData.solicitar_secretaria,
          solicitud_secretaria: formData.solicitud_secretaria,
          estado: formData.solicitar_secretaria ? 'pendiente_secretaria' : 'completada'
        }
      }

      // Crear la actividad
      const newActivity = createActivity(actividadData)
      
      // Si se solicita actividad a secretaría, crear la solicitud
      if (formData.solicitar_secretaria && formData.solicitud_secretaria) {
        const solicitudSecretaria = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          providencia_id: newActivity.id,
          proceso_id: formData.proceso_id,
          expediente_id: formData.expediente_id,
          numero_causa: selectedProcessForAutonomous?.numero_causa || 'N/A',
          instrucciones: formData.solicitud_secretaria,
          estado: 'pendiente',
          fecha_solicitud: new Date().toISOString(),
          solicitado_por: user?.name || 'Juez del Sistema',
          solicitado_por_id: user?.id || 'juez-sistema',
          titulo_providencia: formData.titulo
        }

        // Guardar solicitud en localStorage
        const existingSolicitudes = JSON.parse(localStorage.getItem('satje_solicitudes_secretaria') || '[]')
        existingSolicitudes.push(solicitudSecretaria)
        localStorage.setItem('satje_solicitudes_secretaria', JSON.stringify(existingSolicitudes))
      }
      
      // Si es providencia indexada, marcar el escrito como despachado
      if (formMode === 'indexada' && formData.escrito_vinculado) {
        const success = markWritingAsDispatched(formData.escrito_vinculado, user?.name || 'Usuario')
        if (success) {
          console.log('Escrito marcado como despachado automáticamente')
        }
      }

      console.log('Providencia creada:', newActivity)
      
      const successMessage = formData.solicitar_secretaria 
        ? 'Providencia creada exitosamente. Se ha enviado solicitud a secretaría para completar la actividad solicitada.'
        : 'Providencia creada exitosamente'
      
      alert(successMessage)
      
      setIsSubmitting(false)
      setShowForm(false)
      setFormData({
        titulo: '',
        contenido: '',
        tipo_providencia: '',
        proceso_id: '',
        expediente_id: '',
        escrito_vinculado: '',
        archivo: null,
        solicitar_secretaria: false,
        solicitud_secretaria: ''
      })
      setSelectedWriting(null)
      
    } catch (error) {
      console.error('Error al crear providencia:', error)
      alert('Error al crear la providencia')
      setIsSubmitting(false)
    }
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
                Crear Providencias
              </h1>
              <p className="text-judicial-600">
                Pronunciamientos judiciales indexados o autónomos
              </p>
            </div>

            {/* Modos de Providencia */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-judicial-900 mb-4">
                Tipo de Providencia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleModeChange('indexada')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formMode === 'indexada'
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-judicial-200 hover:border-judicial-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="font-semibold">Providencia Indexada</h3>
                  </div>
                  <p className="text-sm text-judicial-600">
                    Pronunciamiento sobre un escrito específico
                  </p>
                </button>

                <button
                  onClick={() => handleModeChange('autonoma')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    formMode === 'autonoma'
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-judicial-200 hover:border-judicial-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="h-5 w-5" />
                    <h3 className="font-semibold">Providencia Autónoma</h3>
                  </div>
                  <p className="text-sm text-judicial-600">
                    Pronunciamiento de oficio no vinculado a escrito
                  </p>
                </button>
              </div>
            </div>

            {/* Búsqueda de Escrito (solo para indexadas) */}
            {formMode === 'indexada' && (
              <div className="card mb-6">
                <h2 className="text-lg font-semibold text-judicial-900 mb-4">
                  Seleccionar Escrito
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-judicial-400" />
                  <input
                    type="text"
                    placeholder="Buscar escrito por título o número de causa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-judicial-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((writing) => (
                        <div
                          key={writing.id}
                          onClick={() => handleWritingSelect(writing)}
                          className="p-3 hover:bg-judicial-50 cursor-pointer border-b border-judicial-100 last:border-b-0"
                        >
                          <div className="font-medium text-judicial-900">{writing.titulo}</div>
                          <div className="text-sm text-judicial-600">
                            {writing.proceso.numero_causa} • {writing.creado_por}
                          </div>
                          <div className="text-xs text-judicial-500">
                            {new Date(writing.fecha_creacion).toLocaleDateString('es-EC')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información del Escrito Seleccionado */}
            {formMode === 'indexada' && selectedWriting && (
              <div className="card mb-6">
                <h3 className="font-semibold text-judicial-900 mb-3">Escrito Seleccionado</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-green-800">Título:</span>
                      <p className="text-green-700">{selectedWriting.titulo}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Proceso:</span>
                      <p className="text-green-700">{selectedWriting.proceso.numero_causa}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Creado por:</span>
                      <p className="text-green-700">{selectedWriting.creado_por}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Fecha:</span>
                      <p className="text-green-700">
                        {new Date(selectedWriting.fecha_creacion).toLocaleString('es-EC')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Búsqueda de Proceso (solo para autónomas) */}
            {formMode === 'autonoma' && (
              <div className="card mb-6">
                <h2 className="text-lg font-semibold text-judicial-900 mb-4">
                  Seleccionar Proceso
                </h2>
                <p className="text-judicial-600 mb-4">
                  Para providencias autónomas, primero debe seleccionar el proceso donde se registrará
                </p>
                <div className="relative search-dropdown">
                  <input
                    type="text"
                    placeholder="Buscar por número de causa, actor, demandado o asunto..."
                    value={processSearchTerm}
                    onChange={(e) => setProcessSearchTerm(e.target.value)}
                    className="input-field w-full"
                    required
                  />
                  {processSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-judicial-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {processSearchResults.map((process) => (
                        <div
                          key={process.id}
                          onClick={() => handleProcessSelect(process)}
                          className="p-3 hover:bg-judicial-50 cursor-pointer border-b border-judicial-100 last:border-b-0"
                        >
                          <div className="font-medium text-judicial-900">{process.numero_causa}</div>
                          <div className="text-sm text-judicial-600">
                            {process.actor} vs {process.demandado}
                          </div>
                          <div className="text-xs text-judicial-500">{process.asunto}</div>
                          <div className="text-xs text-judicial-400">
                            {process.materia} • {process.lugar}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedProcessForAutonomous && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Proceso Seleccionado</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-800">Número:</span>
                        <p className="text-green-700">{selectedProcessForAutonomous.numero_causa}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">Materia:</span>
                        <p className="text-green-700">{selectedProcessForAutonomous.materia}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">Actor:</span>
                        <p className="text-green-700">{selectedProcessForAutonomous.actor}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-800">Demandado:</span>
                        <p className="text-green-700">{selectedProcessForAutonomous.demandado}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-green-800">Asunto:</span>
                        <p className="text-green-700">{selectedProcessForAutonomous.asunto}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formulario de Providencia */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-judicial-900">
                  {formMode === 'indexada' ? 'Providencia Indexada' : 'Providencia Autónoma'}
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary flex items-center gap-2"
                  disabled={formMode === 'autonoma' && !selectedProcessForAutonomous}
                >
                  <Plus className="h-4 w-4" />
                  {showForm ? 'Cancelar' : 'Crear Providencia'}
                </button>
              </div>

              {formMode === 'autonoma' && !selectedProcessForAutonomous && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-judicial-400 mx-auto mb-4" />
                  <p className="text-judicial-600">
                    Debe seleccionar un proceso antes de crear la providencia autónoma
                  </p>
                </div>
              )}

              {showForm && (formMode === 'indexada' || (formMode === 'autonoma' && selectedProcessForAutonomous)) && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-judicial-700 mb-1">
                        Tipo de Providencia *
                      </label>
                      <select
                        value={formData.tipo_providencia}
                        onChange={(e) => setFormData({...formData, tipo_providencia: e.target.value})}
                        className="input-field"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {(formMode === 'indexada' ? tiposProvidencia : tiposProvidenciaAutonoma).map((tipo) => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-judicial-700 mb-1">
                        Título de la Providencia *
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                        placeholder="Ej: Auto de admisión de demanda"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-judicial-700 mb-1">
                      Contenido de la Providencia *
                    </label>
                    <textarea
                      value={formData.contenido}
                      onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                      placeholder="Escriba aquí el contenido de la providencia..."
                      className="input-field h-40 resize-none"
                      required
                    />
                    <p className="text-xs text-judicial-500 mt-1">
                      Desarrolle el pronunciamiento judicial de manera clara y fundamentada
                    </p>
                  </div>

                  {/* Solicitud a Secretaría */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="solicitar_secretaria"
                        checked={formData.solicitar_secretaria}
                        onChange={(e) => setFormData({...formData, solicitar_secretaria: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="solicitar_secretaria" className="text-sm font-medium text-blue-900">
                        Solicitar actividad a Secretaría
                      </label>
                    </div>
                    
                    {formData.solicitar_secretaria && (
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-1">
                          Instrucciones para Secretaría *
                        </label>
                        <textarea
                          value={formData.solicitud_secretaria}
                          onChange={(e) => setFormData({...formData, solicitud_secretaria: e.target.value})}
                          placeholder="Especifique qué actividad debe realizar la secretaría..."
                          className="input-field h-24 resize-none"
                          required={formData.solicitar_secretaria}
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          La providencia quedará pendiente hasta que la secretaría complete la actividad solicitada
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Carga de Archivo PDF */}
                  <div>
                    <label className="block text-sm font-medium text-judicial-700 mb-1">
                      Archivo Adjunto (Opcional)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="input-field"
                    />
                    <p className="text-xs text-judicial-500 mt-1">
                      Solo archivos PDF (máximo 10MB)
                    </p>
                    {formData.archivo && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Archivo seleccionado: {formData.archivo.name}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Tamaño: {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Información del Proceso Seleccionado (solo para autónomas) */}
                  {formMode === 'autonoma' && selectedProcessForAutonomous && (
                    <div className="bg-judicial-50 border border-judicial-200 rounded-lg p-4">
                      <h3 className="font-medium text-judicial-900 mb-2">Proceso Seleccionado</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium text-judicial-800">Número:</span>
                          <p className="text-judicial-700">{selectedProcessForAutonomous.numero_causa}</p>
                        </div>
                        <div>
                          <span className="font-medium text-judicial-800">Materia:</span>
                          <p className="text-judicial-700">{selectedProcessForAutonomous.materia}</p>
                        </div>
                        <div>
                          <span className="font-medium text-judicial-800">Actor:</span>
                          <p className="text-judicial-700">{selectedProcessForAutonomous.actor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-judicial-800">Demandado:</span>
                          <p className="text-judicial-700">{selectedProcessForAutonomous.demandado}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-judicial-800">Asunto:</span>
                          <p className="text-judicial-700">{selectedProcessForAutonomous.asunto}</p>
                        </div>
                      </div>
                      
                      {/* Selección de Instancia */}
                      <div>
                        <label className="block text-sm font-medium text-judicial-700 mb-2">
                          Seleccionar Instancia *
                        </label>
                        <select
                          value={selectedInstance}
                          onChange={(e) => handleInstanceChange(e.target.value)}
                          className="input-field"
                          required
                        >
                          <option value="">Seleccionar instancia</option>
                          {selectedProcessForAutonomous.expedientes?.map((expediente: any) => (
                            <option key={expediente.id} value={expediente.id}>
                              {expediente.instancia === 'primera' ? 'PRIMER NIVEL' : 
                               expediente.instancia === 'segunda' ? 'SEGUNDO NIVEL' : 
                               expediente.instancia === 'tercera' ? 'TERCER NIVEL' : 
                               expediente.instancia}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-judicial-500 mt-1">
                          Seleccione la instancia donde se registrará la providencia
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Creando...' : 'Crear Providencia'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
