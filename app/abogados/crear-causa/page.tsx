'use client'

import { useState } from 'react'
import { Save, X, FileText, User, Scale } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { getProcesses } from '@/lib/simple-storage'
import { notifyNuevoProceso } from '@/lib/telegram-notifications'
import { useUser } from '@/app/providers'

export default function CrearCausaPage() {
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
    juez_id: ''
  })

  const materias = [
    'Civil',
    'Penal',
    'Laboral',
    'Familia',
    'Administrativo',
    'Constitucional',
    'Tributario',
    'Mercantil'
  ]

  const jueces = [
    { id: 'juez1', name: 'Dr. Juan Pérez' },
    { id: 'juez2', name: 'Dra. María García' },
    { id: 'juez3', name: 'Dr. Carlos López' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Confirmación de seguridad
    if (!confirm(`¿Está seguro de que desea crear este nuevo proceso?\n\nActor: ${formData.actor}\nDemandado: ${formData.demandado}\nAsunto: ${formData.asunto}\n\nEsta acción creará un nuevo proceso judicial.`)) {
      return
    }
    
    setIsSubmitting(true)

    try {
      // Generar número de causa automático
      const currentYear = new Date().getFullYear()
      const existingProcesses = getProcesses()
      const nextNumber = String(existingProcesses.length + 1).padStart(5, '0')
      const numeroCausa = `13999-${currentYear}-${nextNumber}`

      // Crear nuevo proceso
      const newProcess = {
        id: `proc-${Date.now()}`,
        numero_causa: numeroCausa,
        actor: formData.actor,
        cedula_actor: formData.cedula_actor,
        correo_actor: formData.correo_actor,
        abogado_actor: formData.abogado_actor,
        correo_abogado_actor: formData.correo_abogado_actor,
        demandado: formData.demandado,
        cedula_demandado: formData.cedula_demandado,
        correo_demandado: formData.correo_demandado,
        abogado_demandado: formData.abogado_demandado,
        correo_abogado_demandado: formData.correo_abogado_demandado,
        materia: formData.materia,
        asunto: formData.asunto,
        lugar: formData.lugar,
        juez_id: formData.juez_id,
        estado: 'activo' as const,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        es_acumulado: false,
        expedientes: [{
          id: `exp-${Date.now()}`,
          proceso_id: `proc-${Date.now()}`,
          numero_expediente: 1,
          instancia: 'primera' as const,
          estado: 'activo' as const,
          fecha_creacion: new Date().toISOString(),
          actividades: []
        }]
      }

      // Guardar en localStorage
      const allProcesses = getProcesses()
      allProcesses.push(newProcess)
      localStorage.setItem('satje_processes', JSON.stringify(allProcesses))
      
      console.log('Proceso creado:', newProcess)
      alert(`Causa creada exitosamente con número: ${numeroCausa}`)
      
      // Enviar notificación de Telegram al juez
      try {
        await notifyNuevoProceso({
          numero_causa: numeroCausa,
          actor: formData.actor,
          materia: formData.materia,
          usuario: user?.name || 'Abogado',
          proceso_id: newProcess.id
        }, {
          chatId: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || ''
        })
        console.log('Notificación de Telegram enviada al juez')
      } catch (error) {
        console.error('Error enviando notificación de Telegram:', error)
        // No mostrar error al usuario, solo log
      }
      
      // Limpiar formulario
      setFormData({
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
        juez_id: ''
      })
    } catch (error) {
      console.error('Error al crear causa:', error)
      alert('Error al crear la causa')
    } finally {
      setIsSubmitting(false)
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
        <div className="flex-1 lg:ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Crear Nueva Causa
                </h1>
              </div>
              <p className="text-gray-600">
                Complete la información para crear un nuevo proceso judicial
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información del Actor */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Información del Actor</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="actor" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Actor *
                    </label>
                    <input
                      type="text"
                      id="actor"
                      name="actor"
                      value={formData.actor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cedula_actor" className="block text-sm font-medium text-gray-700 mb-1">
                      Cédula del Actor *
                    </label>
                    <input
                      type="text"
                      id="cedula_actor"
                      name="cedula_actor"
                      value={formData.cedula_actor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="correo_actor" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo del Actor *
                    </label>
                    <input
                      type="email"
                      id="correo_actor"
                      name="correo_actor"
                      value={formData.correo_actor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="abogado_actor" className="block text-sm font-medium text-gray-700 mb-1">
                      Abogado del Actor *
                    </label>
                    <input
                      type="text"
                      id="abogado_actor"
                      name="abogado_actor"
                      value={formData.abogado_actor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="correo_abogado_actor" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo del Abogado *
                    </label>
                    <input
                      type="email"
                      id="correo_abogado_actor"
                      name="correo_abogado_actor"
                      value={formData.correo_abogado_actor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Demandado */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Información del Demandado</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="demandado" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Demandado *
                    </label>
                    <input
                      type="text"
                      id="demandado"
                      name="demandado"
                      value={formData.demandado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cedula_demandado" className="block text-sm font-medium text-gray-700 mb-1">
                      Cédula del Demandado *
                    </label>
                    <input
                      type="text"
                      id="cedula_demandado"
                      name="cedula_demandado"
                      value={formData.cedula_demandado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="correo_demandado" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo del Demandado *
                    </label>
                    <input
                      type="email"
                      id="correo_demandado"
                      name="correo_demandado"
                      value={formData.correo_demandado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="abogado_demandado" className="block text-sm font-medium text-gray-700 mb-1">
                      Abogado del Demandado *
                    </label>
                    <input
                      type="text"
                      id="abogado_demandado"
                      name="abogado_demandado"
                      value={formData.abogado_demandado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="correo_abogado_demandado" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo del Abogado *
                    </label>
                    <input
                      type="email"
                      id="correo_abogado_demandado"
                      name="correo_abogado_demandado"
                      value={formData.correo_abogado_demandado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Proceso */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Scale className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Información del Proceso</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-1">
                      Materia *
                    </label>
                    <select
                      id="materia"
                      name="materia"
                      value={formData.materia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar materia</option>
                      {materias.map((materia) => (
                        <option key={materia} value={materia}>{materia}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="lugar" className="block text-sm font-medium text-gray-700 mb-1">
                      Lugar *
                    </label>
                    <input
                      type="text"
                      id="lugar"
                      name="lugar"
                      value={formData.lugar}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="juez_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Juez Asignado *
                    </label>
                    <select
                      id="juez_id"
                      name="juez_id"
                      value={formData.juez_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar juez</option>
                      {jueces.map((juez) => (
                        <option key={juez.id} value={juez.id}>{juez.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-1">
                      Asunto del Proceso *
                    </label>
                    <textarea
                      id="asunto"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Creando Causa...' : 'Crear Causa'}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
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