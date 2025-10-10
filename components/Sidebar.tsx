'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scale,
  Search,
  UserCheck,
  Shield,
  Briefcase,
  Settings,
  User,
  LogIn,
  LogOut,
  ChevronRight,
  ChevronDown,
  FileText,
  Menu,
  X
} from 'lucide-react'
import { useUser } from '@/app/providers'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useUser()
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Cerrar sidebar al hacer clic fuera en móvil
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && onClose) {
        const sidebar = document.getElementById('sidebar')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Scale,
      roles: ['juez', 'secretario', 'admin'],
      href: '/dashboard'
    },
    {
      id: 'search',
      title: 'Búsqueda de Procesos',
      icon: Search,
      roles: ['juez', 'secretario', 'abogado', 'admin', 'public'],
      href: '/'
    },
    {
      id: 'terceros',
      title: 'Terceros',
      icon: UserCheck,
      roles: ['public'],
      href: '/terceros'
    },
    {
      id: 'juez',
      title: 'Funciones de Juez',
      icon: Scale,
      roles: ['juez', 'admin'],
      items: [
        { name: 'Buzón de Despacho', href: '/operadores' },
        { name: 'Crear Providencias', href: '/operadores/providencias' },
        { name: 'Gestión de Instancias', href: '/operadores/instancias' }
      ]
    },
    {
      id: 'secretario',
      title: 'Funciones de Secretario',
      icon: Shield,
      roles: ['secretario', 'admin'],
      items: [
        { name: 'Buzón de Secretaría', href: '/operadores/buzon-secretaria' },
        { name: 'Actuaciones de Secretaría', href: '/operadores/secretaria' }
      ]
    },
    {
      id: 'abogados',
      title: 'Abogados',
      icon: Briefcase,
      roles: ['abogado', 'admin'],
      items: [
        { name: 'Crear Causa', href: '/abogados/crear-causa' },
        { name: 'Ingresar Escritos', href: '/abogados/escritos' }
      ]
    },
    {
      id: 'admin',
      title: 'Administración',
      icon: Settings,
      roles: ['admin'],
      items: [
        { name: 'Procesos', href: '/admin/procesos' },
        { name: 'Usuarios', href: '/admin/usuarios' },
        { name: 'Roles', href: '/admin/roles' },
        { name: 'Configuración', href: '/admin/configuracion' }
      ]
    }
  ]

      const canAccessSection = (section: any) => {
        if (!user) return false
        
        // Si el usuario es público, solo puede acceder a búsqueda y terceros
        if (user.role === 'public') {
          return section.id === 'search' || section.id === 'terceros'
        }
        
        // Verificar si el usuario tiene acceso a la sección
        return section.roles.includes(user.role)
      }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`
          fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-judicial-200 shadow-sm z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6">
          {/* Header con botón de cerrar en móvil */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-judicial-900">SATJE</h1>
                <p className="text-xs text-judicial-600">Simulator</p>
              </div>
            </div>
            {/* Botón de cerrar solo en móvil */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        {/* User Info */}
        {user ? (
          <div className="mb-6 p-3 bg-judicial-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-judicial-900">{user.name}</p>
                <p className="text-xs text-judicial-600 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <Link href="/auth/login" className="btn-primary w-full flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(section.id)
            const hasAccess = canAccessSection(section)

            if (!hasAccess) return null

            if (section.href) {
              // Elemento directo (sin submenú)
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className="flex items-center gap-3 p-3 text-judicial-700 hover:bg-judicial-50 rounded-lg transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{section.title}</span>
                </Link>
              )
            } else if (section.items && section.items.length > 0) {
              // Elemento con submenú
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-3 text-left text-judicial-700 hover:bg-judicial-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-judicial-400 transition-transform rotate-180" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-judicial-400 transition-transform" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 p-3 text-judicial-600 hover:bg-judicial-50 rounded-lg transition-colors text-sm"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            } else {
              // Fallback para elementos sin href ni items
              return (
                <Link
                  key={section.id}
                  href="#"
                  className="flex items-center gap-3 p-3 text-judicial-700 hover:bg-judicial-50 rounded-lg transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{section.title}</span>
                </Link>
              )
            }
          })}
        </nav>

            {/* Logout Button */}
            {user && (
              <div className="mt-8 pt-6 border-t border-judicial-200">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-3 text-judicial-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </div>
            )}
        </div>
      </div>
    </>
  )
}