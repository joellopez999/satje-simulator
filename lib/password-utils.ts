// Utilidades para manejo de contraseñas en SATJE

export interface UserPassword {
  id: string
  user_id: string
  password: string
  is_temporary: boolean
  created_at: string
  expires_at?: string
  changed_at?: string
}

// Generar contraseña temporal aleatoria
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  
  // Asegurar al menos una mayúscula, una minúscula y un número
  password += chars[Math.floor(Math.random() * 26)] // Mayúscula
  password += chars[26 + Math.floor(Math.random() * 26)] // Minúscula
  password += chars[52 + Math.floor(Math.random() * 10)] // Número
  
  // Completar con caracteres aleatorios
  for (let i = 3; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Generar contraseña personalizada
export function generateCustomPassword(): string {
  const adjectives = ['Rapido', 'Seguro', 'Fuerte', 'Nuevo', 'Activo', 'Verde', 'Azul', 'Rojo']
  const nouns = ['Sistema', 'Usuario', 'Acceso', 'Login', 'Portal', 'Panel', 'Admin']
  const numbers = Math.floor(Math.random() * 999) + 1
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  
  return `${adjective}${noun}${numbers}`
}

// Obtener contraseñas de usuarios desde localStorage
export function getUserPasswords(): UserPassword[] {
  try {
    const stored = localStorage.getItem('satje_user_passwords')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading user passwords:', error)
    return []
  }
}

// Guardar contraseñas de usuarios en localStorage
export function saveUserPasswords(passwords: UserPassword[]): void {
  try {
    localStorage.setItem('satje_user_passwords', JSON.stringify(passwords))
  } catch (error) {
    console.error('Error saving user passwords:', error)
  }
}

// Obtener contraseña de un usuario específico
export function getUserPassword(userId: string): UserPassword | null {
  const passwords = getUserPasswords()
  return passwords.find(p => p.user_id === userId) || null
}

// Crear nueva contraseña para usuario
export function createUserPassword(userId: string, password: string, isTemporary: boolean = true): UserPassword {
  const newPassword: UserPassword = {
    id: Date.now().toString(),
    user_id: userId,
    password: password,
    is_temporary: isTemporary,
    created_at: new Date().toISOString(),
    expires_at: isTemporary ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined // 30 días
  }
  
  const passwords = getUserPasswords()
  passwords.push(newPassword)
  saveUserPasswords(passwords)
  
  return newPassword
}

// Actualizar contraseña de usuario
export function updateUserPassword(userId: string, newPassword: string, isTemporary: boolean = false): UserPassword | null {
  const passwords = getUserPasswords()
  const existingIndex = passwords.findIndex(p => p.user_id === userId)
  
  if (existingIndex !== -1) {
    passwords[existingIndex] = {
      ...passwords[existingIndex],
      password: newPassword,
      is_temporary: isTemporary,
      changed_at: new Date().toISOString(),
      expires_at: isTemporary ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    }
  } else {
    passwords.push({
      id: Date.now().toString(),
      user_id: userId,
      password: newPassword,
      is_temporary: isTemporary,
      created_at: new Date().toISOString(),
      expires_at: isTemporary ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    })
  }
  
  saveUserPasswords(passwords)
  return passwords[existingIndex !== -1 ? existingIndex : passwords.length - 1]
}

// Verificar si una contraseña es válida (para login)
export function validatePassword(userId: string, password: string): boolean {
  const userPassword = getUserPassword(userId)
  if (!userPassword) return false
  
  // Verificar si la contraseña temporal ha expirado
  if (userPassword.is_temporary && userPassword.expires_at) {
    const now = new Date()
    const expiresAt = new Date(userPassword.expires_at)
    if (now > expiresAt) return false
  }
  
  return userPassword.password === password
}
