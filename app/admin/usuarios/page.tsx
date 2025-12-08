'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, User, Mail, Shield, CheckCircle, XCircle, Eye, EyeOff, Key, RefreshCw } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import MobileHeader from '@/components/MobileHeader'
import { useUser } from '@/app/providers'
import {
  generateTemporaryPassword,
  generateCustomPassword,
  getUserPassword,
  createUserPassword,
  updateUserPassword,
  getUserPasswords
} from '@/lib/password-utils'
import { logAuditAction } from '@/lib/audit'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'juez' | 'secretario' | 'abogado' | 'tercero'
  is_active: boolean
  created_at: string
  last_login?: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'abogado' as 'admin' | 'juez' | 'secretario' | 'abogado' | 'tercero',
    password: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isTemporary: true
  })
  const { user } = useUser()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      } else {
        console.error('Error loading users:', data.error)
        alert('Error al cargar usuarios: ' + data.error)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    // Verificar si el email ya existe
    if (users.some(u => u.email === formData.email)) {
      alert('Ya existe un usuario con este email')
      return
    }

    // Generar contraseña temporal
    const tempPassword = generateTemporaryPassword()

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: tempPassword,
          is_temporary: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error al crear usuario: ' + data.error)
        return
      }

      // Reload users
      await loadUsers()

      await logAuditAction('CREATE_USER', {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }, user?.id)

      // Limpiar formulario
      setFormData({ name: '', email: '', role: 'abogado', password: '' })
      setShowCreateModal(false)

      // Mostrar contraseña generada
      alert(`Usuario creado exitosamente!\n\nContraseña temporal: ${tempPassword}\n\nEsta contraseña expira en 30 días.`)
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
    }
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit)
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      password: ''
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.name || !formData.email || !formData.role) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    // Verificar si el email ya existe en otro usuario
    if (users.some(u => u.email === formData.email && u.id !== editingUser.id)) {
      alert('Ya existe otro usuario con este email')
      return
    }

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error al actualizar usuario: ' + data.error)
        return
      }

      // Reload users
      await loadUsers()

      await logAuditAction('UPDATE_USER', {
        user_id: editingUser.id,
        name: formData.name,
        email: formData.email,
        role: formData.role
      }, user?.id)

      setShowEditModal(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', role: 'abogado', password: '' })

      alert('Usuario actualizado exitosamente')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar usuario')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      alert('No puedes eliminar tu propio usuario')
      return
    }

    // Buscar el usuario que se va a eliminar
    const userToDelete = users.find(u => u.id === userId)
    if (!userToDelete) {
      alert('Usuario no encontrado')
      return
    }

    // Verificar si es el último administrador
    if (userToDelete.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length
      if (adminCount === 1) {
        alert('No se puede eliminar el último administrador del sistema. Debe haber al menos un administrador.')
        return
      }
    }

    if (confirm(`¿Está seguro de que desea eliminar al usuario "${userToDelete.name}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (!response.ok) {
          alert('Error al eliminar usuario: ' + data.error)
          return
        }

        // Reload users
        await loadUsers()

        await logAuditAction('DELETE_USER', {
          user_id: userId,
          user_name: userToDelete.name
        }, user?.id)

        alert('Usuario eliminado exitosamente')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error al eliminar usuario')
      }
    }
  }

  const handleToggleStatus = async (userId: string) => {
    const userToToggle = users.find(u => u.id === userId)
    if (!userToToggle) {
      alert('Usuario no encontrado')
      return
    }

    // Si se va a desactivar un administrador, verificar que no sea el último
    if (userToToggle.role === 'admin' && userToToggle.is_active) {
      const activeAdminCount = users.filter(u => u.role === 'admin' && u.is_active).length
      if (activeAdminCount === 1) {
        alert('No se puede desactivar el último administrador activo del sistema. Debe haber al menos un administrador activo.')
        return
      }
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !userToToggle.is_active
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error al cambiar estado: ' + data.error)
        return
      }

      // Reload users
      await loadUsers()

      const action = userToToggle.is_active ? 'desactivado' : 'activado'

      await logAuditAction('TOGGLE_USER_STATUS', {
        user_id: userId,
        new_status: !userToToggle.is_active ? 'active' : 'inactive'
      }, user?.id)

      alert(`Usuario ${action} exitosamente`)
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Error al cambiar estado del usuario')
    }
  }

  const handleShowPassword = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  const handleChangePassword = (userToChange: User) => {
    setSelectedUser(userToChange)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isTemporary: true
    })
    setShowPasswordModal(true)
  }

  const handleGenerateNewPassword = () => {
    const newPassword = generateTemporaryPassword()
    setPasswordData(prev => ({
      ...prev,
      newPassword: newPassword,
      confirmPassword: newPassword
    }))
  }

  const handleGenerateCustomPassword = () => {
    const customPassword = generateCustomPassword()
    setPasswordData(prev => ({
      ...prev,
      newPassword: customPassword,
      confirmPassword: customPassword
    }))
  }

  const handleUpdatePassword = async () => {
    if (!selectedUser) return

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Por favor complete todos los campos')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.newPassword,
          is_temporary: passwordData.isTemporary
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Error al actualizar contraseña: ' + data.error)
        return
      }

      setShowPasswordModal(false)

      await logAuditAction('CHANGE_USER_PASSWORD', {
        target_user_id: selectedUser.id,
        is_temporary: passwordData.isTemporary
      }, user?.id)

      setSelectedUser(null)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        isTemporary: true
      })

      alert('Contraseña actualizada exitosamente')
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Error al actualizar contraseña')
    }
  }

  const [userPasswords, setUserPasswords] = useState<{ [key: string]: string }>({})

  // Load passwords for all users
  useEffect(() => {
    const loadPasswords = async () => {
      const passwords: { [key: string]: string } = {}
      for (const u of users) {
        try {
          const response = await fetch(`/api/users/${u.id}/password`)
          const data = await response.json()
          if (response.ok && data.password) {
            passwords[u.id] = data.password.password
          }
        } catch (error) {
          console.error(`Error loading password for user ${u.id}:`, error)
        }
      }
      setUserPasswords(passwords)
    }

    if (users.length > 0) {
      loadPasswords()
    }
  }, [users])

  const getUserPasswordDisplay = (userId: string) => {
    const password = userPasswords[userId]
    if (!password) return 'Sin contraseña'

    const isVisible = showPasswords[userId]
    return isVisible ? password : '••••••••'
  }

  const isLastAdmin = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user || user.role !== 'admin') return false

    const adminCount = users.filter(u => u.role === 'admin').length
    return adminCount === 1
  }

  const isLastActiveAdmin = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user || user.role !== 'admin' || !user.is_active) return false

    const activeAdminCount = users.filter(u => u.role === 'admin' && u.is_active).length
    return activeAdminCount === 1
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-5 w-5 text-red-600" />
      case 'juez': return <User className="h-5 w-5 text-blue-600" />
      case 'secretario': return <User className="h-5 w-5 text-green-600" />
      case 'abogado': return <User className="h-5 w-5 text-purple-600" />
      case 'tercero': return <User className="h-5 w-5 text-gray-600" />
      default: return <User className="h-5 w-5 text-gray-600" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'juez': return 'Juez'
      case 'secretario': return 'Secretario'
      case 'abogado': return 'Abogado'
      case 'tercero': return 'Tercero'
      default: return role
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
                    Gestión de Usuarios
                  </h1>
                  <p className="text-gray-600">
                    Administre los usuarios del sistema SATJE
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Nuevo Usuario
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contraseña
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Creación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRoleIcon(userItem.role)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{userItem.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getRoleLabel(userItem.role)}
                            </span>
                            {isLastAdmin(userItem.id) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Último Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {userItem.is_active ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className={`ml-2 text-sm ${userItem.is_active ? 'text-green-600' : 'text-red-600'}`}>
                              {userItem.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-mono text-gray-900 mr-2">
                              {getUserPasswordDisplay(userItem.id)}
                            </span>
                            <button
                              onClick={() => handleShowPassword(userItem.id)}
                              className="text-gray-400 hover:text-gray-600"
                              title={showPasswords[userItem.id] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                              {showPasswords[userItem.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(userItem.created_at).toLocaleDateString('es-EC')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(userItem)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleChangePassword(userItem)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Cambiar contraseña"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(userItem.id)}
                              disabled={isLastActiveAdmin(userItem.id)}
                              className={`p-1 ${isLastActiveAdmin(userItem.id)
                                ? 'text-gray-400 cursor-not-allowed'
                                : userItem.is_active
                                  ? 'text-red-600 hover:text-red-900'
                                  : 'text-green-600 hover:text-green-900'
                                }`}
                              title={isLastActiveAdmin(userItem.id)
                                ? 'No se puede desactivar el último administrador activo'
                                : userItem.is_active
                                  ? 'Desactivar usuario'
                                  : 'Activar usuario'
                              }
                            >
                              {userItem.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            {userItem.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(userItem.id)}
                                disabled={isLastAdmin(userItem.id)}
                                className={`p-1 ${isLastAdmin(userItem.id)
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-red-600 hover:text-red-900'
                                  }`}
                                title={isLastAdmin(userItem.id)
                                  ? 'No se puede eliminar el último administrador'
                                  : 'Eliminar usuario'
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Crear Nuevo Usuario
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Dr. Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="abogado">Abogado</option>
                        <option value="juez">Juez</option>
                        <option value="secretario">Secretario</option>
                        <option value="tercero">Tercero</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateUser}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Crear Usuario
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Editar Usuario
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="abogado">Abogado</option>
                        <option value="juez">Juez</option>
                        <option value="secretario">Secretario</option>
                        <option value="tercero">Tercero</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowEditModal(false)
                        setEditingUser(null)
                        setFormData({ name: '', email: '', role: 'abogado', password: '' })
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpdateUser}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Actualizar Usuario
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Cambiar Contraseña - {selectedUser.name}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ingrese nueva contraseña"
                        />
                        <button
                          onClick={handleGenerateNewPassword}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                          title="Generar contraseña aleatoria"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleGenerateCustomPassword}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                          title="Generar contraseña personalizada"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña *
                      </label>
                      <input
                        type="text"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirme la contraseña"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isTemporary"
                        checked={passwordData.isTemporary}
                        onChange={(e) => setPasswordData({ ...passwordData, isTemporary: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isTemporary" className="ml-2 block text-sm text-gray-900">
                        Contraseña temporal (expira en 30 días)
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowPasswordModal(false)
                        setSelectedUser(null)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                          isTemporary: true
                        })
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Actualizar Contraseña
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}