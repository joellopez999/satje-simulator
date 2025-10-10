'use client'

import { useState, useEffect } from 'react'
import { 
  Scale, 
  Plus, 
  Save, 
  X,
  Search,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Gavel
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { getProcesses, createActivity } from '@/lib/simple-storage'

export default function InstanciasPage() {
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedProcess, setSelectedProcess] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processes, setProcesses] = useState<any[]>([])
  const [selectedInstance, setSelectedInstance] = useState<'segunda' | 'tercera'>('segunda')
  
  const [formData, setFormData] = useState({
    proceso_id: '',
    expediente_id: ''
  })

  const tiposSegundaInstancia = [
    'Apelación',
    'Recurso de Apelación',
    'Recurso de Casación',
    'Recurso de Revisión',
    'Recurso de Amparo',
    'Recurso de Hábeas Corpus',
    'Recurso de Hábeas Data',
    'Recurso de Inconstitucionalidad',
    'Recurso de Protección',
    'Otros'
  ]

  const tiposTerceraInstancia = [
    'Recurso Extraordinario de Casación',
    'Recurso de Revisión Extraordinario',
    'Recurso de Amparo Extraordinario',
    'Recurso de Inconstitucionalidad Extraordinario',
    'Recurso de Protección Extraordinario',
    'Recurso de Hábeas Corpus Extraordinario',
    'Recurso de Hábeas Data Extraordinario',
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
    
    const instanciaText = selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia Extraordinaria'
    
    setFormData(prev => ({
      ...prev,
      proceso_id: process.id,
      expediente_id: process.expedientes?.[0]?.id || '',
      contenido: `Apertura de ${instanciaText} - ${process.numero_causa} - ${fechaHora}`
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleInstanceChange = (instance: 'segunda' | 'tercera') => {
    setSelectedInstance(instance)
    setFormData(prev => ({
      ...prev,
      tipo_instancia: '',
      motivo: '',
      fundamento_legal: '',
      contenido: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Confirmación de seguridad
    const instanciaText = selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia'
    if (!confirm(`¿Está seguro de que desea aperturar la ${instanciaText}?\n\nProceso: ${selectedProcess?.numero_causa}\n\nEsta acción creará una nueva instancia judicial.`)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      if (!formData.expediente_id || !formData.proceso_id) {
        throw new Error('Debe seleccionar un proceso válido.')
      }

      // Verificar si la instancia ya existe
      const instanciaText = selectedInstance === 'segunda' ? 'segunda' : 'tercera'
      const instanciaExistente = selectedProcess.expedientes?.find((exp: any) => exp.instancia === instanciaText)
      
      if (instanciaExistente) {
        alert(`La ${selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia Extraordinaria'} ya existe para este proceso.`)
        setIsSubmitting(false)
        return
      }

      // Crear nuevo expediente para la instancia
      const numeroExpediente = selectedProcess.expedientes ? selectedProcess.expedientes.length + 1 : 1
      
      const nuevoExpediente = {
        id: `exp-${selectedProcess.id}-${numeroExpediente}`,
        proceso_id: selectedProcess.id,
        numero_expediente: numeroExpediente,
        instancia: instanciaText as 'segunda' | 'tercera',
        estado: 'activo' as const,
        fecha_creacion: new Date().toISOString(),
        actividades: []
      }

      // Agregar el nuevo expediente al proceso
      const allProcesses = getProcesses()
      const processIndex = allProcesses.findIndex(p => p.id === selectedProcess.id)
      
      if (processIndex !== -1) {
        if (!allProcesses[processIndex].expedientes) {
          allProcesses[processIndex].expedientes = []
        }
        allProcesses[processIndex].expedientes.push(nuevoExpediente)
        
        // Guardar cambios
        localStorage.setItem('satje_processes', JSON.stringify(allProcesses))
      }

      // Crear actividad de apertura
      const actividadData = {
        expediente_id: nuevoExpediente.id,
        tipo: 'otros' as const,
        titulo: `Apertura de ${selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia Extraordinaria'}`,
        contenido: `Se apertura la ${selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia Extraordinaria'} para el proceso ${selectedProcess.numero_causa}`,
        creado_por: 'Juez del Sistema',
        metadata: {
          es_apertura_instancia: true,
          nivel_instancia: selectedInstance,
          proceso_id: formData.proceso_id
        }
      }

      // Crear la actividad
      const newActivity = createActivity(actividadData)

      console.log('Instancia creada:', newActivity)
      alert(`${selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia Extraordinaria'} aperturada exitosamente`)
      
      setIsSubmitting(false)
      setShowForm(false)
      setFormData({
        proceso_id: '',
        expediente_id: ''
      })
      setSelectedProcess(null)
      setSearchTerm('')
      
    } catch (error) {
      console.error('Error al crear instancia:', error)
      alert(error instanceof Error ? error.message : 'Error al crear la instancia')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-judicial-50">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="h-8 w-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-judicial-900">
                  Gestión de Instancias Judiciales
                </h1>
              </div>
              <p className="text-judicial-600">
                Aperture segunda instancia o tercera instancia extraordinaria en los procesos
              </p>
            </div>

            {/* Selección de Tipo de Instancia */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-judicial-900 mb-4">
                Tipo de Instancia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleInstanceChange('segunda')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedInstance === 'segunda'
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-judicial-200 hover:border-judicial-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowUp className="h-5 w-5" />
                    <h3 className="font-semibold">Segunda Instancia</h3>
                  </div>
                  <p className="text-sm text-judicial-600">
                    Apelaciones y recursos ordinarios
                  </p>
                </button>

                <button
                  onClick={() => handleInstanceChange('tercera')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedInstance === 'tercera'
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-judicial-200 hover:border-judicial-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Gavel className="h-5 w-5" />
                    <h3 className="font-semibold">Tercera Instancia Extraordinaria</h3>
                  </div>
                  <p className="text-sm text-judicial-600">
                    Recursos extraordinarios y de casación
                  </p>
                </button>
              </div>
            </div>

            {/* Búsqueda de Proceso */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-judicial-900 mb-4">
                Seleccionar Proceso
              </h2>
              <p className="text-judicial-600 mb-4">
                Busque el proceso donde desea aperturar la {selectedInstance === 'segunda' ? 'segunda instancia' : 'tercera instancia extraordinaria'}
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

            {/* Formulario de Apertura de Instancia */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-judicial-900">
                  Aperturar {selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia Extraordinaria'}
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="btn-primary flex items-center gap-2"
                  disabled={!selectedProcess}
                >
                  <Plus className="h-4 w-4" />
                  {showForm ? 'Cancelar' : 'Aperturar Instancia'}
                </button>
              </div>

              {!selectedProcess && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-judicial-400 mx-auto mb-4" />
                  <p className="text-judicial-600">
                    Debe seleccionar un proceso antes de aperturar la instancia
                  </p>
                </div>
              )}

              {showForm && selectedProcess && (
                <div className="space-y-6">
                  {/* Información del Proceso Seleccionado */}
                  <div className="bg-judicial-50 border border-judicial-200 rounded-lg p-4">
                    <h3 className="font-medium text-judicial-900 mb-2">Proceso Seleccionado</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                  </div>

                  {/* Confirmación de apertura */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Confirmación de Apertura</h4>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Se creará la {selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia Extraordinaria'} para este proceso. 
                      Una vez aperturada, podrá crear providencias y actuaciones específicas para esta instancia.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? 'Aperturando...' : `Aperturar ${selectedInstance === 'segunda' ? 'Segunda Instancia' : 'Tercera Instancia'}`}
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
