'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, X, User, Users, Scale, Hash, Mail, Briefcase } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/app/providers'
import { getProcesses, updateProcess, getUsers } from '@/lib/storage'
import { Process } from '@/lib/types'

export default function EditarProcesoPage() {
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const processId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [process, setProcess] = useState<any>(null)
  const [formData, setFormData] = useState({
    actor: '',
    cedula_actor: '',
    correo_actor: '',
    abogado_actor: '',
    correo_abogado_actor: '',
    demandado: '',
    cedula_demandado: '',
    correo_demandado: '',
    abogado_demandado: '',
    correo_abogado_demandado: '',
    materia: '',
    asunto: '',
    lugar: '',
    juez_id: '',
    estado: 'activo' as 'activo' | 'acumulado' | 'archivado' | 'concluido'
  })

  // Obtener lista de jueces
  const jueces = getUsers().filter(u => u.role === 'juez').map(juez => ({
    id: juez.id,
    name: juez.name,
  }))

  const materias = [
    'Civil',
    'Penal',
    'Laboral',
    'Familia',
    'Administrativo',
    'Constitucional',
    'Mercantil',
    'Tributario'
  ]

  const estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'acumulado', label: 'Acumulado' },
    { value: 'archivado', label: 'Archivado' },
    { value: 'concluido', label: 'Concluido' }
  ]

  useEffect(() => {
    loadProcess()
  }, [processId])

  const loadProcess = () => {
    try {
      const processes = getProcesses()
      const foundProcess = processes.find(p => p.id === processId)
      
      if (!foundProcess) {
        alert('Proceso no encontrado')
        router.push('/admin/procesos')
        return
      }

      setProcess(foundProcess)
      setFormData({
        actor: foundProcess.actor || '',
        cedula_actor: foundProcess.cedula_actor || '',
        correo_actor: foundProcess.correo_actor || '',
        abogado_actor: foundProcess.abogado_actor || '',
        correo_abogado_actor: foundProcess.correo_abogado_actor || '',
        demandado: foundProcess.demandado || '',
        cedula_demandado: foundProcess.cedula_demandado || '',
        correo_demandado: foundProcess.correo_demandado || '',
        abogado_demandado: foundProcess.abogado_demandado || '',
        correo_abogado_demandado: foundProcess.correo_abogado_demandado || '',
        materia: foundProcess.materia || '',
        asunto: foundProcess.asunto || '',
        lugar: foundProcess.lugar || '',
        juez_id: foundProcess.juez_id || '',
        estado: foundProcess.estado || 'activo'
      })
    } catch (error) {
      console.error('Error loading process:', error)
      alert('Error al cargar el proceso')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos obligatorios
      const requiredFields = [
        'actor', 'cedula_actor', 'correo_actor', 'abogado_actor', 'correo_abogado_actor',
        'demandado', 'cedula_demandado', 'correo_demandado', 'abogado_demandado', 'correo_abogado_demandado',
        'materia', 'asunto', 'lugar', 'juez_id'
      ]

      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])

      if (missingFields.length > 0) {
        alert(`Por favor, complete los siguientes campos obligatorios: ${missingFields.join(', ')}`)
        setIsSubmitting(false)
        return
      }

      // Actualizar el proceso
      const updatedProcess = updateProcess(processId, formData)

      console.log('Proceso actualizado:', updatedProcess)
      alert('Proceso actualizado exitosamente')
      
      // Redirigir a la lista de procesos
      router.push('/admin/procesos')
    } catch (error) {
      console.error('Error updating process:', error)
      alert('Error al actualizar el proceso')
      setIsSubmitting(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-judicial-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-judicial-900 mb-4">Acceso Denegado</h1>
          <p className="text-judicial-600 mb-6">Solo los administradores pueden acceder a esta sección.</p>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-judicial-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-judicial-600">Cargando proceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-judicial-50">
      <div className="flex">
        <Sidebar />

        <div className="flex-1 ml-64">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-judicial-900 mb-2">
                Editar Proceso
              </h1>
              <p className="text-judicial-600">
                Modificar información del proceso {process.numero_causa}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información del Actor */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-judicial-900">
                    Información del Actor/Accionante
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="actor" className="block text-sm font-medium text-judicial-700 mb-1">
                      Nombre Completo del Actor *
                    </label>
                    <input
                      type="text"
                      id="actor"
                      name="actor"
                      value={formData.actor}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cedula_actor" className="block text-sm font-medium text-judicial-700 mb-1">
                      Cédula del Actor *
                    </label>
                    <input
                      type="text"
                      id="cedula_actor"
                      name="cedula_actor"
                      value={formData.cedula_actor}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="correo_actor" className="block text-sm font-medium text-judicial-700 mb-1">
                      Correo del Actor *
                    </label>
                    <input
                      type="email"
                      id="correo_actor"
                      name="correo_actor"
                      value={formData.correo_actor}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="abogado_actor" className="block text-sm font-medium text-judicial-700 mb-1">
                      Abogado del Actor *
                    </label>
                    <input
                      type="text"
                      id="abogado_actor"
                      name="abogado_actor"
                      value={formData.abogado_actor}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="correo_abogado_actor" className="block text-sm font-medium text-judicial-700 mb-1">
                      Correo del Abogado del Actor *
                    </label>
                    <input
                      type="email"
                      id="correo_abogado_actor"
                      name="correo_abogado_actor"
                      value={formData.correo_abogado_actor}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Demandado */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-judicial-900">
                    Información del Demandado/Accionado
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="demandado" className="block text-sm font-medium text-judicial-700 mb-1">
                      Nombre Completo del Demandado *
                    </label>
                    <input
                      type="text"
                      id="demandado"
                      name="demandado"
                      value={formData.demandado}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cedula_demandado" className="block text-sm font-medium text-judicial-700 mb-1">
                      Cédula del Demandado *
                    </label>
                    <input
                      type="text"
                      id="cedula_demandado"
                      name="cedula_demandado"
                      value={formData.cedula_demandado}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="correo_demandado" className="block text-sm font-medium text-judicial-700 mb-1">
                      Correo del Demandado *
                    </label>
                    <input
                      type="email"
                      id="correo_demandado"
                      name="correo_demandado"
                      value={formData.correo_demandado}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="abogado_demandado" className="block text-sm font-medium text-judicial-700 mb-1">
                      Abogado del Demandado *
                    </label>
                    <input
                      type="text"
                      id="abogado_demandado"
                      name="abogado_demandado"
                      value={formData.abogado_demandado}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="correo_abogado_demandado" className="block text-sm font-medium text-judicial-700 mb-1">
                      Correo del Abogado del Demandado *
                    </label>
                    <input
                      type="email"
                      id="correo_abogado_demandado"
                      name="correo_abogado_demandado"
                      value={formData.correo_abogado_demandado}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Detalles de la Causa */}
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Scale className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-judicial-900">
                    Detalles de la Causa
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="materia" className="block text-sm font-medium text-judicial-700 mb-1">
                      Materia *
                    </label>
                    <select
                      id="materia"
                      name="materia"
                      value={formData.materia}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Seleccionar materia</option>
                      {materias.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="asunto" className="block text-sm font-medium text-judicial-700 mb-1">
                      Asunto/Motivo de la Acción *
                    </label>
                    <input
                      type="text"
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lugar" className="block text-sm font-medium text-judicial-700 mb-1">
                      Lugar *
                    </label>
                    <input
                      type="text"
                      id="lugar"
                      name="lugar"
                      value={formData.lugar}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="juez_id" className="block text-sm font-medium text-judicial-700 mb-1">
                      Juez Asignado *
                    </label>
                    <select
                      id="juez_id"
                      name="juez_id"
                      value={formData.juez_id}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Seleccionar juez</option>
                      {jueces.map((juez) => (
                        <option key={juez.id} value={juez.id}>{juez.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-judicial-700 mb-1">
                      Estado del Proceso *
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      {estados.map((estado) => (
                        <option key={estado.value} value={estado.value}>{estado.label}</option>
                      ))}
                    </select>
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
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Proceso'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/procesos')}
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
  )
}
