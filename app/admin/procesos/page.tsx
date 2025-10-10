'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Plus, Edit, Trash2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { getProcesses } from '@/lib/simple-storage'

export default function AdminProcesosPage() {
  const [processes, setProcesses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProcess, setEditingProcess] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    actor: '',
    demandado: '',
    asunto: '',
    materia: '',
    lugar: '',
    estado: 'activo'
  })

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
  }, [])

  const filteredProcesses = processes.filter(process =>
    process.numero_causa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.demandado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.materia.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditProcess = (process: any) => {
    setEditingProcess(process)
    setEditForm({
      actor: process.actor || '',
      demandado: process.demandado || '',
      asunto: process.asunto || '',
      materia: process.materia || '',
      lugar: process.lugar || '',
      estado: process.estado || 'activo'
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editingProcess) return

    const updatedProcesses = processes.map(process => {
      if (process.id === editingProcess.id) {
        return {
          ...process,
          ...editForm,
          fecha_actualizacion: new Date().toISOString()
        }
      }
      return process
    })

    setProcesses(updatedProcesses)
    localStorage.setItem('satje_processes', JSON.stringify(updatedProcesses))
    setShowEditModal(false)
    setEditingProcess(null)
    alert('Proceso actualizado exitosamente')
  }

  const handleDeleteProcess = (processId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este proceso? Esta acción no se puede deshacer.')) {
      const updatedProcesses = processes.filter(process => process.id !== processId)
      setProcesses(updatedProcesses)
      localStorage.setItem('satje_processes', JSON.stringify(updatedProcesses))
      alert('Proceso eliminado exitosamente')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Administración de Procesos
              </h1>
              <p className="text-gray-600">
                Gestiona todos los procesos judiciales del sistema
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Procesos</p>
                    <p className="text-2xl font-bold text-gray-900">{processes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {processes.filter(p => p.estado === 'activo').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Acumulados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {processes.filter(p => p.estado === 'acumulado').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Archivados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {processes.filter(p => p.estado === 'archivado').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar procesos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Proceso
                </button>
              </div>
            </div>

            {/* Processes Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número de Causa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demandado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Materia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProcesses.map((process) => (
                      <tr key={process.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {process.numero_causa}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {process.actor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {process.demandado}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {process.materia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            process.estado === 'activo'
                              ? 'bg-green-100 text-green-800'
                              : process.estado === 'acumulado'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {process.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditProcess(process)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Editar proceso"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProcess(process.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Eliminar proceso"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Editar Proceso: {editingProcess?.numero_causa}
              </h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actor
                  </label>
                  <input
                    type="text"
                    value={editForm.actor}
                    onChange={(e) => setEditForm(prev => ({ ...prev, actor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Demandado
                  </label>
                  <input
                    type="text"
                    value={editForm.demandado}
                    onChange={(e) => setEditForm(prev => ({ ...prev, demandado: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={editForm.asunto}
                    onChange={(e) => setEditForm(prev => ({ ...prev, asunto: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materia
                  </label>
                  <input
                    type="text"
                    value={editForm.materia}
                    onChange={(e) => setEditForm(prev => ({ ...prev, materia: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lugar
                  </label>
                  <input
                    type="text"
                    value={editForm.lugar}
                    onChange={(e) => setEditForm(prev => ({ ...prev, lugar: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="acumulado">Acumulado</option>
                    <option value="archivado">Archivado</option>
                  </select>
                </div>
              </form>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}