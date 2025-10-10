'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'

interface ProcessSearchProps {
  onSearch: (results: any[]) => void
  onSearching: (searching: boolean) => void
  allProcesses?: any[]
}

export default function ProcessSearch({ onSearch, onSearching, allProcesses = [] }: ProcessSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchTerm.length >= 1 && allProcesses.length > 0) {
      onSearching(true)

      // Búsqueda local
      const filtered = allProcesses.filter(process => {
        if (!process) return false

        const searchLower = searchTerm.toLowerCase()
        return (
          (process.numero_causa && process.numero_causa.toLowerCase().includes(searchLower)) ||
          (process.actor && process.actor.toLowerCase().includes(searchLower)) ||
          (process.demandado && process.demandado.toLowerCase().includes(searchLower)) ||
          (process.asunto && process.asunto.toLowerCase().includes(searchLower)) ||
          (process.materia && process.materia.toLowerCase().includes(searchLower))
        )
      })

      onSearch(filtered)
      onSearching(false)
    } else if (searchTerm.length === 0) {
      onSearch([])
      onSearching(false)
    }
  }, [searchTerm, allProcesses, onSearch, onSearching])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (searchTerm.length >= 1 && allProcesses.length > 0) {
      onSearching(true)

      const filtered = allProcesses.filter(process => {
        if (!process) return false

        const searchLower = searchTerm.toLowerCase()
        return (
          (process.numero_causa && process.numero_causa.toLowerCase().includes(searchLower)) ||
          (process.actor && process.actor.toLowerCase().includes(searchLower)) ||
          (process.demandado && process.demandado.toLowerCase().includes(searchLower)) ||
          (process.asunto && process.asunto.toLowerCase().includes(searchLower)) ||
          (process.materia && process.materia.toLowerCase().includes(searchLower))
        )
      })

      onSearch(filtered)
      onSearching(false)
    } else {
      onSearch([])
      onSearching(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Búsqueda principal */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-judicial-400" />
          <input
            type="text"
            placeholder="Buscar por número de causa, actor, demandado, asunto o materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">
          Buscar
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-secondary flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t border-judicial-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filter-actor" className="block text-sm font-medium text-judicial-700 mb-1">
                Actor
              </label>
              <input type="text" id="filter-actor" className="input-field" placeholder="Nombre del actor" />
            </div>
            <div>
              <label htmlFor="filter-demandado" className="block text-sm font-medium text-judicial-700 mb-1">
                Demandado
              </label>
              <input type="text" id="filter-demandado" className="input-field" placeholder="Nombre del demandado" />
            </div>
            <div>
              <label htmlFor="filter-materia" className="block text-sm font-medium text-judicial-700 mb-1">
                Materia
              </label>
              <select id="filter-materia" className="input-field">
                <option value="">Todas</option>
                <option value="civil">Civil</option>
                <option value="penal">Penal</option>
                <option value="laboral">Laboral</option>
                <option value="contencioso">Contencioso Administrativo</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-estado" className="block text-sm font-medium text-judicial-700 mb-1">
                Estado
              </label>
              <select id="filter-estado" className="input-field">
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="acumulado">Acumulado</option>
                <option value="archivado">Archivado</option>
                <option value="concluido">Concluido</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}