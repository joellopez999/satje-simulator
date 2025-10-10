'use client'

import { useState, useEffect } from 'react'
import { getProcesses, searchProcesses } from '@/lib/storage'

export default function TestDropdownPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

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

  const handleProcessSelect = (proceso: any) => {
    console.log('Proceso seleccionado:', proceso)
    setSearchTerm(proceso.numero_causa)
    setSearchResults([])
  }

  return (
    <div className="min-h-screen bg-judicial-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Test Dropdown</h1>
      
      <div className="max-w-md">
        <div className="relative search-dropdown">
          <input
            type="text"
            placeholder="Buscar por número de causa (ej: 13999-2025-00123)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Resultados de búsqueda en tiempo real */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((proceso) => (
                <div
                  key={proceso.id}
                  onClick={() => handleProcessSelect(proceso)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{proceso.numero_causa}</div>
                  <div className="text-sm text-gray-600">{proceso.asunto}</div>
                  <div className="text-xs text-gray-500">
                    {proceso.actor} vs {proceso.demandado}
                  </div>
                  <div className="text-xs text-gray-400">
                    Iniciado: {new Date(proceso.fecha_creacion).toLocaleDateString('es-EC')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Búsqueda: {searchTerm}</p>
            <p className="text-green-600">Resultados: {searchResults.length}</p>
          </div>
        )}
      </div>
    </div>
  )
}
