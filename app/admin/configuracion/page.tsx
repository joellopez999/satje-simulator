'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Database, Mail, Bell, Shield, Globe } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { useUser } from '@/app/providers'

interface SystemConfig {
  general: {
    siteName: string
    siteDescription: string
    timezone: string
    language: string
  }
  database: {
    backupEnabled: boolean
    backupFrequency: string
    retentionDays: number
  }
  notifications: {
    emailEnabled: boolean
    smtpHost: string
    smtpPort: number
    smtpUser: string
    telegramEnabled: boolean
    telegramBotToken: string
  }
  security: {
    sessionTimeout: number
    passwordPolicy: string
    twoFactorEnabled: boolean
  }
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      siteName: 'SATJE Simulator',
      siteDescription: 'Sistema Automático de Trámite Judicial Ecuatoriano',
      timezone: 'America/Guayaquil',
      language: 'es'
    },
    database: {
      backupEnabled: true,
      backupFrequency: 'daily',
      retentionDays: 30
    },
    notifications: {
      emailEnabled: false,
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      telegramEnabled: false,
      telegramBotToken: ''
    },
    security: {
      sessionTimeout: 30,
      passwordPolicy: 'medium',
      twoFactorEnabled: false
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        if (data && Object.keys(data).length > 0) {
          // Merge with default config to ensure all fields exist
          setConfig(prev => ({
            ...prev,
            ...data
          }))
        }
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        alert('Configuración guardada exitosamente')
      } else {
        throw new Error('Error saving config')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('¿Está seguro de restablecer la configuración a los valores por defecto?')) {
      setConfig({
        general: {
          siteName: 'SATJE Simulator',
          siteDescription: 'Sistema Automático de Trámite Judicial Ecuatoriano',
          timezone: 'America/Guayaquil',
          language: 'es'
        },
        database: {
          backupEnabled: true,
          backupFrequency: 'daily',
          retentionDays: 30
        },
        notifications: {
          emailEnabled: false,
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          telegramEnabled: false,
          telegramBotToken: ''
        },
        security: {
          sessionTimeout: 30,
          passwordPolicy: 'medium',
          twoFactorEnabled: false
        }
      })
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'database', label: 'Base de Datos', icon: Database },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Configuración del Sistema
                  </h1>
                  <p className="text-gray-600">
                    Administre la configuración general del sistema
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReset}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restablecer
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Sitio
                      </label>
                      <input
                        type="text"
                        value={config.general.siteName}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          general: { ...prev.general, siteName: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zona Horaria
                      </label>
                      <select
                        value={config.general.timezone}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          general: { ...prev.general, timezone: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="America/Guayaquil">Guayaquil (GMT-5)</option>
                        <option value="America/Quito">Quito (GMT-5)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idioma
                      </label>
                      <select
                        value={config.general.language}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          general: { ...prev.general, language: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción del Sitio
                    </label>
                    <textarea
                      value={config.general.siteDescription}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        general: { ...prev.general, siteDescription: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Base de Datos</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Habilitar Respaldo Automático</h4>
                        <p className="text-sm text-gray-600">Crear respaldos automáticos de la base de datos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.database.backupEnabled}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            database: { ...prev.database, backupEnabled: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {config.database.backupEnabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frecuencia de Respaldo
                          </label>
                          <select
                            value={config.database.backupFrequency}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              database: { ...prev.database, backupFrequency: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="hourly">Cada hora</option>
                            <option value="daily">Diario</option>
                            <option value="weekly">Semanal</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Días de Retención
                          </label>
                          <input
                            type="number"
                            value={config.database.retentionDays}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              database: { ...prev.database, retentionDays: parseInt(e.target.value) }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                            max="365"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Notificaciones</h3>

                  <div className="space-y-6">
                    {/* Email Configuration */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-900">Notificaciones por Email</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.notifications.emailEnabled}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, emailEnabled: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {config.notifications.emailEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Servidor SMTP
                            </label>
                            <input
                              type="text"
                              value={config.notifications.smtpHost}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                notifications: { ...prev.notifications, smtpHost: e.target.value }
                              }))}
                              placeholder="smtp.gmail.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Puerto
                            </label>
                            <input
                              type="number"
                              value={config.notifications.smtpPort}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                notifications: { ...prev.notifications, smtpPort: parseInt(e.target.value) }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Usuario SMTP
                            </label>
                            <input
                              type="email"
                              value={config.notifications.smtpUser}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                notifications: { ...prev.notifications, smtpUser: e.target.value }
                              }))}
                              placeholder="usuario@ejemplo.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Telegram Configuration */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-900">Notificaciones por Telegram</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.notifications.telegramEnabled}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, telegramEnabled: e.target.checked }
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {config.notifications.telegramEnabled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Token del Bot de Telegram
                          </label>
                          <input
                            type="password"
                            value={config.notifications.telegramBotToken}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, telegramBotToken: e.target.value }
                            }))}
                            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Obtenga el token creando un bot con @BotFather en Telegram
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo de Expiración de Sesión (minutos)
                      </label>
                      <input
                        type="number"
                        value={config.security.sessionTimeout}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="5"
                        max="480"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Política de Contraseñas
                      </label>
                      <select
                        value={config.security.passwordPolicy}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          security: { ...prev.security, passwordPolicy: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Baja (mínimo 6 caracteres)</option>
                        <option value="medium">Media (mínimo 8 caracteres, números y letras)</option>
                        <option value="high">Alta (mínimo 12 caracteres, números, letras y símbolos)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Autenticación de Dos Factores</h4>
                        <p className="text-sm text-gray-600">Requerir código de verificación adicional</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.security.twoFactorEnabled}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            security: { ...prev.security, twoFactorEnabled: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
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
