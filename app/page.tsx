'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Scale, FileText } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { searchProcesses } from '@/lib/storage'
import { useUser } from '@/app/providers'

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNoResultsMessage, setShowNoResultsMessage] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user, isLoading } = useUser()
  const router = useRouter()

  // No redirigir automáticamente - permitir acceso sin autenticación

  // Búsqueda en tiempo real usando searchProcesses
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.length >= 3) {
        setIsSearching(true)
        try {
          const params = new URLSearchParams()
          params.append('numero_causa', searchTerm)
          const response = await fetch(`/api/processes/search?${params.toString()}`)
          if (!response.ok) throw new Error('Error fetching processes')
          const results = await response.json()
          setSearchResults(results)
        } catch (error) {
          console.error('Error searching processes:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setIsSearching(false)
      }
    }

    performSearch()
  }, [searchTerm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchTerm.length >= 3) {
      setIsSearching(true)
      try {
        const params = new URLSearchParams()
        params.append('numero_causa', searchTerm)
        const response = await fetch(`/api/processes/search?${params.toString()}`)
        if (!response.ok) throw new Error('Error fetching processes')
        const results = await response.json()
        setSearchResults(results)
        setShowNoResultsMessage(results.length === 0)
      } catch (error) {
        console.error('Error searching processes:', error)
        setSearchResults([])
        setShowNoResultsMessage(true)
      } finally {
        setIsSearching(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {user && <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />}

      <div className="flex">
        {/* Sidebar - Solo mostrar si hay usuario autenticado */}
        {user && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className={`flex-1 ${user ? 'lg:ml-64' : ''} flex items-center justify-center p-4 lg:p-8`}>
          <div className="max-w-4xl w-full">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Scale className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">SATJE Simulator</h1>
              </div>
              <p className="text-gray-600 text-lg mb-4">
                Sistema Automático de Trámite Judicial Ecuatoriano
              </p>

              {/* Botón de Login - Solo mostrar si no hay usuario autenticado */}
              {!user && (
                <div className="flex justify-center gap-4">
                  <a
                    href="/auth/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Iniciar Sesión
                  </a>
                  <a
                    href="/terceros"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Envío de Terceros
                  </a>
                </div>
              )}
            </div>

            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Search className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Expediente Electrónico - Búsqueda de Procesos
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por número de causa (ej: 13999-2025-00123)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>

            {/* Mensaje de No Hay Resultados */}
            {showNoResultsMessage && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      No se encontraron resultados
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Verifique el número de proceso o intente con otros criterios de búsqueda.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {isSearching ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Buscando procesos...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resultados de Búsqueda ({searchResults.length})
                  </h3>
                </div>

                <div className="space-y-4">
                  {searchResults.map((process) => (
                    <div key={process.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {process.numero_causa}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {process.materia}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${process.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : process.estado === 'acumulado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {process.estado}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        Actor: {process.actor} | Demandado: {process.demandado}
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        Asunto: {process.asunto}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Creado: {new Date(process.fecha_creacion).toLocaleDateString('es-EC')}
                        </span>
                        <a
                          href={`/proceso/${process.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                        >
                          Ver Expediente
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 && searchTerm.length >= 3 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron procesos con los criterios de búsqueda</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}