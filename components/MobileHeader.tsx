'use client'

import { useState } from 'react'
import { Menu, Scale } from 'lucide-react'
import { useUser } from '@/app/providers'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user } = useUser()

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Scale className="h-6 w-6 text-primary-600" />
        <span className="font-bold text-gray-900">SATJE</span>
      </div>

      {/* Menú hamburguesa */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  )
}
