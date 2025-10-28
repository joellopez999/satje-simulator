// Utilidades para autenticación con Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'juez' | 'secretario' | 'abogado' | 'tercero'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserPassword {
  user_id: string
  password: string
  is_temporary: boolean
  created_at: string
}

// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUsers:', error)
    return []
  }
}

// Función para obtener un usuario por email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserByEmail:', error)
    return null
  }
}

// Función para crear un nuevo usuario
export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createUser:', error)
    return null
  }
}

// Función para actualizar un usuario
export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateUser:', error)
    return null
  }
}

// Función para eliminar un usuario
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteUser:', error)
    return false
  }
}

// Función para verificar contraseña (usando la tabla user_passwords)
export async function validateUserPassword(userId: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_passwords')
      .select('password')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error validating password:', error)
      return false
    }

    return data?.password === password
  } catch (error) {
    console.error('Error in validateUserPassword:', error)
    return false
  }
}

// Función para crear contraseña de usuario
export async function createUserPassword(userId: string, password: string, isTemporary: boolean = false): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_passwords')
      .insert([{
        user_id: userId,
        password: password,
        is_temporary: isTemporary,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error creating user password:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in createUserPassword:', error)
    return false
  }
}

// Función para actualizar contraseña de usuario
export async function updateUserPassword(userId: string, newPassword: string, isTemporary: boolean = false): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_passwords')
      .update({
        password: newPassword,
        is_temporary: isTemporary,
        created_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating user password:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateUserPassword:', error)
    return false
  }
}

// Función para inicializar usuarios por defecto
export async function initializeDefaultUsers(): Promise<boolean> {
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await getUsers()
    if (existingUsers.length > 0) {
      console.log('Usuarios ya existen, saltando inicialización')
      return true
    }

    // Crear usuarios por defecto
    const defaultUsers = [
      {
        email: 'admin@satje.ec',
        name: 'Administrador del Sistema',
        role: 'admin' as const,
        is_active: true
      },
      {
        email: 'juez@satje.ec',
        name: 'Dr. Juan Pérez',
        role: 'juez' as const,
        is_active: true
      },
      {
        email: 'secretario@satje.ec',
        name: 'Lic. María González',
        role: 'secretario' as const,
        is_active: true
      },
      {
        email: 'abogado@satje.ec',
        name: 'Abg. Carlos López',
        role: 'abogado' as const,
        is_active: true
      }
    ]

    const defaultPasswords = [
      { password: 'admin123', isTemporary: false },
      { password: 'juez123', isTemporary: false },
      { password: 'secretario123', isTemporary: false },
      { password: 'abogado123', isTemporary: false }
    ]

    // Crear usuarios
    for (let i = 0; i < defaultUsers.length; i++) {
      const user = await createUser(defaultUsers[i])
      if (user) {
        await createUserPassword(user.id, defaultPasswords[i].password, defaultPasswords[i].isTemporary)
        console.log(`Usuario creado: ${user.name}`)
      }
    }

    console.log('✅ Usuarios por defecto inicializados en Supabase')
    return true
  } catch (error) {
    console.error('Error initializing default users:', error)
    return false
  }
}
