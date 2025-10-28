'use client'

import { useState, useEffect } from 'react'
import { User, Save, X, Search, Scale, ArrowLeft, Home } from 'lucide-react'
import { getProcesses, createActivity } from '@/lib/simple-storage'

export default function TercerosPage() {
  const [selectedProcess, setSelectedProcess] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [processes, setProcesses] = useState<any[]>([])

  const [terceroData, setTerceroData] = useState({
    nombre_tercero: '',
    cedula_tercero: '',
    correo_tercero: '',
    tipo_tercero: 'perito',
    titulo: '',
    contenido: '',
    archivo: null as File | null
  })

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

  useEffect(() => {
    if (searchTerm.length >= 1) {
      const results = processes.filter(process =>
        process.numero_causa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.demandado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.asunto.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchTerm, processes])

  const tiposTercero = [
    { value: 'perito', label: 'Perito' },
    { value: 'testigo', label: 'Testigo' },
    { value: 'coadyuvante', label: 'Coadyuvante' },
    { value: 'excluyente', label: 'Excluyente' },
    { value: 'otro', label: 'Otro' }
  ]

  const handleProcessSelect = (process: any) => {
    setSelectedProcess(process)
    setSearchTerm(process.numero_causa)
    setSearchResults([])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTerceroData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessor']
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF, DOC o DOCX')
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
      
      setTerceroData(prev => ({ ...prev, archivo: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Confirmación de seguridad
    if (!confirm(`¿Está seguro de que desea enviar este escrito como tercero?\n\nProceso: ${selectedProcess?.numero_causa}\nTítulo: ${terceroData.titulo}\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      if (!selectedProcess) {
        alert('Por favor seleccione un proceso')
        setIsSubmitting(false)
        return
      }

      // Validar campos obligatorios
      if (!terceroData.nombre_tercero || !terceroData.cedula_tercero || !terceroData.correo_tercero || !terceroData.titulo || !terceroData.contenido) {
        alert('Por favor complete todos los campos obligatorios')
        setIsSubmitting(false)
        return
      }

      // Obtener el expediente del proceso seleccionado
      const expediente = selectedProcess.expedientes?.[0] // Tomar el primer expediente (PRIMER NIVEL)
      if (!expediente) {
        alert('No se encontró expediente para este proceso')
        setIsSubmitting(false)
        return
      }

      // Procesar archivo si existe
      let archivoBase64 = null
      if (terceroData.archivo) {
        try {
          archivoBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(terceroData.archivo!)
          })
        } catch (error) {
          console.error('Error al procesar archivo:', error)
          alert('Error al procesar el archivo. Intente nuevamente.')
          setIsSubmitting(false)
          return
        }
      }

      // Preparar datos de la actividad
      const actividadData = {
        expediente_id: expediente.id, // ID real del expediente
        tipo: 'escrito' as const,
        titulo: `Escrito de Tercero - ${terceroData.titulo}`,
        contenido: `Escrito presentado por ${terceroData.tipo_tercero}: ${terceroData.nombre_tercero}\n\n${terceroData.contenido}`,
        creado_por: `${terceroData.nombre_tercero} (${terceroData.tipo_tercero})`,
        archivo_url: archivoBase64, // Guardar archivo como base64
        metadata: {
          es_tercero: true,
          tipo_tercero: terceroData.tipo_tercero,
          nombre_tercero: terceroData.nombre_tercero,
          cedula_tercero: terceroData.cedula_tercero,
          correo_tercero: terceroData.correo_tercero,
          archivo_info: terceroData.archivo ? {
            nombre: terceroData.archivo.name,
            tamaño: terceroData.archivo.size,
            tipo: terceroData.archivo.type,
            fecha_subida: new Date().toISOString()
          } : null
        }
      }

      // Crear la actividad
      const newActivity = createActivity(actividadData)

      console.log('Escrito de tercero creado:', newActivity)
      alert(`Escrito de tercero ingresado exitosamente en el proceso ${selectedProcess.numero_causa}`)

      // Limpiar formulario
      setTerceroData({
        nombre_tercero: '',
        cedula_tercero: '',
        correo_tercero: '',
        tipo_tercero: 'perito',
        titulo: '',
        contenido: '',
        archivo: null
      })
      setSelectedProcess(null)
      setSearchTerm('')
    } catch (error) {
      console.error('Error al crear escrito de tercero:', error)
      alert('Error al crear el escrito de tercero')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-judicial-50">
      <div className="flex flex-col">
        {/* Header con navegación */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Scale className="h-8 w-8 text-primary-600" />
                  <h1 className="text-xl font-bold text-judicial-900">
                    SATJE Simulator
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                >
                  <Search className="h-4 w-4" />
                  Búsqueda de Procesos
                </a>
                <a
                  href="/auth/login"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                >
                  <User className="h-4 w-4" />
                  Iniciar Sesión
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-8">
            {/* Header de la página */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-8 w-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-judicial-900">
                  Ingreso para Terceros
                </h2>
              </div>
              <p className="text-judicial-600">
                Ingrese escritos como perito, testigo, coadyuvante u otro tercero interesado.
              </p>
            </div>

            <div className="space-y-8">
              {/* Selección de Proceso */}
              <div className="card">
                <h3 className="font-medium text-judicial-900 mb-4">Seleccionar Proceso</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por número de causa, actor, demandado o asunto..."
                    className="input-field w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchResults.length > 0 && searchTerm.length >= 1 && (
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
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información del Tercero */}
                <div className="card">
                  <h3 className="font-medium text-judicial-900 mb-4">Información del Tercero</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombre_tercero" className="block text-sm font-medium text-judicial-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="nombre_tercero"
                        name="nombre_tercero"
                        value={terceroData.nombre_tercero}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cedula_tercero" className="block text-sm font-medium text-judicial-700 mb-1">
                        Cédula *
                      </label>
                      <input
                        type="text"
                        id="cedula_tercero"
                        name="cedula_tercero"
                        value={terceroData.cedula_tercero}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="correo_tercero" className="block text-sm font-medium text-judicial-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        id="correo_tercero"
                        name="correo_tercero"
                        value={terceroData.correo_tercero}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="tipo_tercero" className="block text-sm font-medium text-judicial-700 mb-1">
                        Tipo de Tercero *
                      </label>
                      <select
                        id="tipo_tercero"
                        name="tipo_tercero"
                        value={terceroData.tipo_tercero}
                        onChange={handleInputChange}
                        className="input-field"
                        required
                      >
                        {tiposTercero.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Detalles del Escrito */}
                <div className="card">
                  <h3 className="font-medium text-judicial-900 mb-4">Detalles del Escrito</h3>
                  <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-judicial-700 mb-1">
                      Título del Escrito *
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      name="titulo"
                      value={terceroData.titulo}
                      onChange={handleInputChange}
                      placeholder="Ej: Informe pericial, Declaración testimonial, etc."
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="contenido" className="block text-sm font-medium text-judicial-700 mb-1">
                      Contenido del Escrito *
                    </label>
                    <textarea
                      id="contenido"
                      name="contenido"
                      value={terceroData.contenido}
                      onChange={handleInputChange}
                      placeholder="Describa el contenido de su escrito..."
                      rows={6}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Carga de Archivo */}
                  <div className="mt-4">
                    <label htmlFor="archivo" className="block text-sm font-medium text-judicial-700 mb-1">
                      Archivo Adjunto (Opcional)
                    </label>
                    <input
                      type="file"
                      id="archivo"
                      name="archivo"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="input-field"
                    />
                    <p className="text-xs text-judicial-500 mt-1">
                      Formatos permitidos: PDF, DOC, DOCX (máximo 10MB)
                    </p>
                    {terceroData.archivo && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Archivo seleccionado: {terceroData.archivo.name}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Tamaño: {(terceroData.archivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Ingresando Escrito...' : 'Ingresar Escrito'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTerceroData({
                        nombre_tercero: '',
                        cedula_tercero: '',
                        correo_tercero: '',
                        tipo_tercero: 'perito',
                        titulo: '',
                        contenido: '',
                        archivo: null
                      })
                      setSelectedProcess(null)
                      setSearchTerm('')
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}