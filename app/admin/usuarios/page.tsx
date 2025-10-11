'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, User, Mail, Shield, CheckCircle, XCircle, Eye, EyeOff, Key, RefreshCw } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useUser } from '@/app/providers'
import { 
  generateTemporaryPassword, 
  generateCustomPassword, 
  getUserPassword, 
  createUserPassword, 
  updateUserPassword,
  getUserPasswords 
} from '@/lib/password-utils'

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
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({})
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

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem('satje_users')
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers))
      } else {
        // Usuarios por defecto
        const defaultUsers: User[] = [
          {
            id: '1',
            name: 'Administrador del Sistema',
            email: 'admin@satje.ec',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Dr. Juan Pérez',
            email: 'juez@satje.ec',
            role: 'juez',
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Lic. María González',
            email: 'secretario@satje.ec',
            role: 'secretario',
            is_active: true,
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Abg. Carlos López',
            email: 'abogado@satje.ec',
            role: 'abogado',
            is_active: true,
            created_at: new Date().toISOString()
          }
        ]
        setUsers(defaultUsers)
        localStorage.setItem('satje_users', JSON.stringify(defaultUsers))
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    // Verificar si el email ya existe
    if (users.some(u => u.email === formData.email)) {
      alert('Ya existe un usuario con este email')
      return
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      is_active: true,
      created_at: new Date().toISOString()
    }

    // Generar contraseña temporal
    const tempPassword = generateTemporaryPassword()
    createUserPassword(newUser.id, tempPassword, true)

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('satje_users', JSON.stringify(updatedUsers))
    
    // Limpiar formulario
    setFormData({ name: '', email: '', role: 'abogado', password: '' })
    setShowCreateModal(false)
    
    // Mostrar contraseña generada
    alert(`Usuario creado exitosamente!\n\nContraseña temporal: ${tempPassword}\n\nEsta contraseña expira en 30 días.`)
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

  const handleUpdateUser = () => {
    if (!editingUser || !formData.name || !formData.email || !formData.role) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    // Verificar si el email ya existe en otro usuario
    if (users.some(u => u.email === formData.email && u.id !== editingUser.id)) {
      alert('Ya existe otro usuario con este email')
      return
    }

    const updatedUsers = users.map(u => 
      u.id === editingUser.id 
        ? { ...u, name: formData.name, email: formData.email, role: formData.role }
        : u
    )
    
    setUsers(updatedUsers)
    localStorage.setItem('satje_users', JSON.stringify(updatedUsers))
    
    setShowEditModal(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'abogado', password: '' })
    
    alert('Usuario actualizado exitosamente')
  }

  const handleDeleteUser = (userId: string) => {
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
      const updatedUsers = users.filter(u => u.id !== userId)
      setUsers(updatedUsers)
      localStorage.setItem('satje_users', JSON.stringify(updatedUsers))
      alert('Usuario eliminado exitosamente')
    }
  }

  const handleToggleStatus = (userId: string) => {
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

    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, is_active: !u.is_active } : u
    )
    setUsers(updatedUsers)
    localStorage.setItem('satje_users', JSON.stringify(updatedUsers))
    
    const action = userToToggle.is_active ? 'desactivado' : 'activado'
    alert(`Usuario ${action} exitosamente`)
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

  const handleUpdatePassword = () => {
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

    updateUserPassword(selectedUser.id, passwordData.newPassword, passwordData.isTemporary)
    
    setShowPasswordModal(false)
    setSelectedUser(null)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isTemporary: true
    })
    
    alert('Contraseña actualizada exitosamente')
  }

  const getUserPasswordDisplay = (userId: string) => {
    const userPassword = getUserPassword(userId)
    if (!userPassword) return 'Sin contraseña'
    
    const isVisible = showPasswords[userId]
    return isVisible ? userPassword.password : '••••••••'
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
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

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
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getRoleLabel(user.role)}
                            </span>
                            {isLastAdmin(user.id) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Último Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.is_active ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className={`ml-2 text-sm ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-mono text-gray-900 mr-2">
                              {getUserPasswordDisplay(user.id)}
                            </span>
                            <button
                              onClick={() => handleShowPassword(user.id)}
                              className="text-gray-400 hover:text-gray-600"
                              title={showPasswords[user.id] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                              {showPasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('es-EC')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Editar usuario"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleChangePassword(user)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Cambiar contraseña"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={isLastActiveAdmin(user.id)}
                              className={`p-1 ${isLastActiveAdmin(user.id) 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : user.is_active 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={isLastActiveAdmin(user.id) 
                                ? 'No se puede desactivar el último administrador activo' 
                                : user.is_active 
                                  ? 'Desactivar usuario' 
                                  : 'Activar usuario'
                              }
                            >
                              {user.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            {user.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={isLastAdmin(user.id)}
                                className={`p-1 ${isLastAdmin(user.id) 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-red-600 hover:text-red-900'
                                }`}
                                title={isLastAdmin(user.id) 
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