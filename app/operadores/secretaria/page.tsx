'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Save, 
  X,
  Search,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Scale
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { getProcesses, createActivity } from '@/lib/simple-storage'
import { uploadFileToSupabase, validateFile } from '@/lib/supabase-storage-utils'
import { useUser } from '@/app/providers'

export default function SecretariaPage() {
  const { user } = useUser()
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedProcess, setSelectedProcess] = useState<any>(null)
  const [selectedInstance, setSelectedInstance] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [processes, setProcesses] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    tipo_actuacion: '',
    titulo: '',
    contenido: '',
    proceso_id: '',
    expediente_id: '',
    archivo: null as File | null
  })

  const tiposActuacion = [
    'Razón',
    'Oficio',
    'Notificación',
    'Citación',
    'Emplazamiento',
    'Traslado',
    'Diligencia',
    'Constancia',
    'Certificación',
    'Otros'
  ]

  useEffect(() => {
    const loadProcesses = () => {
      try {
        const allProcesses = getProcesses()
        setProcesses(allProcesses)
      } catch (error) {
        console.error('Error loading processes:', error)
        setProcesses([])
      }
    }

    loadProcesses()
  }, [])

  // Búsqueda de procesos
  useEffect(() => {
    if (searchTerm.length >= 1) {
      const filtered = processes.filter(process => {
        const searchLower = searchTerm.toLowerCase()
        return (
          (process.numero_causa && process.numero_causa.toLowerCase().includes(searchLower)) ||
          (process.actor && process.actor.toLowerCase().includes(searchLower)) ||
          (process.demandado && process.demandado.toLowerCase().includes(searchLower)) ||
          (process.asunto && process.asunto.toLowerCase().includes(searchLower))
        )
      })
      setSearchResults(filtered)
    } else {
      setSearchResults([])
    }
  }, [searchTerm, processes])

  // Cerrar dropdown al hacer clic fuera
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

  const handleProcessSelect = (process: any) => {
    setSelectedProcess(process)
    setSearchTerm(process.numero_causa)
    setSearchResults([])
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
    
    setFormData(prev => ({
      ...prev,
      proceso_id: process.id,
      expediente_id: process.expedientes?.[0]?.id || '',
      titulo: `Actuación de Secretaría - ${process.numero_causa} - ${fechaHora}`
    }))
  }

  const handleInstanceChange = (instanceId: string) => {
    setSelectedInstance(instanceId)
    if (selectedProcess) {
      const expediente = selectedProcess.expedientes?.find((exp: any) => exp.id === instanceId)
      if (expediente) {
        setFormData(prev => ({
          ...prev,
          expediente_id: expediente.id
        }))
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar archivo usando la utilidad
      const validation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf']
      })
      
      if (!validation.valid) {
        alert(validation.error)
        e.target.value = ''
        return
      }
      
      setFormData(prev => ({ ...prev, archivo: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Confirmación de seguridad
    if (!confirm(`¿Está seguro de que desea crear esta actuación de secretaría?\n\nTipo: ${formData.tipo_actuacion}\nTítulo: ${formData.titulo}\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      if (!formData.expediente_id || !formData.proceso_id) {
        throw new Error('Debe seleccionar un proceso válido.')
      }

      if (!formData.tipo_actuacion || !formData.titulo || !formData.contenido) {
        throw new Error('Por favor complete todos los campos obligatorios.')
      }

      // Procesar archivo si existe
      let archivoUrl = null
      if (formData.archivo) {
        try {
          // Subir archivo a Supabase Storage
          const uploadResult = await uploadFileToSupabase(
            formData.archivo,
            'satje-files',
            'actividades'
          )
          
          if (!uploadResult.success) {
            alert(`Error al subir archivo: ${uploadResult.error}`)
            setIsSubmitting(false)
            return
          }
          
          archivoUrl = uploadResult.url
        } catch (error) {
          console.error('Error al procesar archivo:', error)
          alert('Error al procesar el archivo. Intente nuevamente.')
          setIsSubmitting(false)
          return
        }
      }

      const actividadData = {
        expediente_id: formData.expediente_id,
        tipo: 'razon' as const,
        titulo: formData.titulo,
        contenido: formData.contenido,
        archivo_url: archivoUrl,
        creado_por: user?.name || 'Secretario del Sistema',
        metadata: {
          tipo_actuacion: formData.tipo_actuacion,
          proceso_id: formData.proceso_id,
          es_secretaria: true,
          usuario_creador: {
            id: user?.id || 'unknown',
            nombre: user?.name || 'Secretario del Sistema',
            email: user?.email || 'secretario@satje.com',
            rol: user?.role || 'secretario'
          },
          archivo_info: formData.archivo ? {
            nombre: formData.archivo.name,
            tamaño: formData.archivo.size,
            tipo: formData.archivo.type,
            fecha_subida: new Date().toISOString()
          } : null
        }
      }

      // Crear la actividad
      const newActivity = createActivity(actividadData)

      console.log('Actuación de secretaría creada:', newActivity)
      alert('Actuación de secretaría registrada exitosamente')
      
      setIsSubmitting(false)
      setShowForm(false)
      setFormData({
        tipo_actuacion: '',
        titulo: '',
        contenido: '',
        proceso_id: '',
        expediente_id: '',
        archivo: null
      })
      setSelectedProcess(null)
      setSearchTerm('')
      
    } catch (error) {
      console.error('Error al crear actuación:', error)
      alert(error instanceof Error ? error.message : 'Error al crear la actuación')
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
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-judicial-900">
                  Actuaciones de Secretaría
                </h1>
              </div>
              <p className="text-judicial-600">
                Registre actuaciones administrativas y de secretaría en los expedientes
              </p>
            </div>

            {/* Búsqueda de Proceso */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-judicial-900 mb-4">
                Seleccionar Proceso
              </h2>
              <p className="text-judicial-600 mb-4">
                Busque el proceso donde desea registrar la actuación de secretaría
              </p>
              <div className="relative search-dropdown">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-judicial-400" />
                <input
                  type="text"
                  placeholder="Buscar por número de causa, actor, demandado o asunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-judicial-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((process) => (
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
              
              {selectedProcess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Proceso Seleccionado</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                    <div className="col-span-2">
                      <span className="font-medium text-green-800">Asunto:</span>
                      <p className="text-green-700">{selectedProcess.asunto}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario de Actuación */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-judicial-900">
                  Registrar Actuación de Secretaría
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary flex items-center gap-2"
                  disabled={!selectedProcess}
                >
                  <Plus className="h-4 w-4" />
                  {showForm ? 'Cancelar' : 'Registrar Actuación'}
                </button>
              </div>

              {!selectedProcess && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-judicial-400 mx-auto mb-4" />
                  <p className="text-judicial-600">
                    Debe seleccionar un proceso antes de registrar la actuación
                  </p>
                </div>
              )}

              {showForm && selectedProcess && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-judicial-700 mb-1">
                        Tipo de Actuación *
                      </label>
                      <select
                        name="tipo_actuacion"
                        value={formData.tipo_actuacion}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposActuacion.map((tipo) => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-judicial-700 mb-1">
                        Título de la Actuación *
                      </label>
                      <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        placeholder="Ej: Razón de admisión de demanda"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-judicial-700 mb-1">
                      Contenido de la Actuación *
                    </label>
                    <textarea
                      name="contenido"
                      value={formData.contenido}
                      onChange={handleInputChange}
                      placeholder="Describa el contenido de la actuación de secretaría..."
                      className="input-field h-40 resize-none"
                      required
                    />
                    <p className="text-xs text-judicial-500 mt-1">
                      Desarrolle el contenido de la actuación de manera clara y detallada
                    </p>
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

                  {/* Información del Proceso Seleccionado */}
                  {selectedProcess && (
                    <div className="bg-judicial-50 border border-judicial-200 rounded-lg p-4">
                      <h3 className="font-medium text-judicial-900 mb-2">Proceso Seleccionado</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium text-judicial-800">Número:</span>
                          <p className="text-judicial-700">{selectedProcess.numero_causa}</p>
                        </div>
                        <div>
                          <span className="font-medium text-judicial-800">Materia:</span>
                          <p className="text-judicial-700">{selectedProcess.materia}</p>
                        </div>
                        <div>
                          <span className="font-medium text-judicial-800">Actor:</span>
                          <p className="text-judicial-700">{selectedProcess.actor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-judicial-800">Demandado:</span>
                          <p className="text-judicial-700">{selectedProcess.demandado}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-judicial-800">Asunto:</span>
                          <p className="text-judicial-700">{selectedProcess.asunto}</p>
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
                          {selectedProcess.expedientes?.map((expediente: any) => (
                            <option key={expediente.id} value={expediente.id}>
                              {expediente.instancia === 'primera' ? 'PRIMER NIVEL' : 
                               expediente.instancia === 'segunda' ? 'SEGUNDO NIVEL' : 
                               expediente.instancia === 'tercera' ? 'TERCER NIVEL' : 
                               expediente.instancia}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-judicial-500 mt-1">
                          Seleccione la instancia donde se registrará la actuación
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
                      {isSubmitting ? 'Registrando...' : 'Registrar Actuación'}
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
