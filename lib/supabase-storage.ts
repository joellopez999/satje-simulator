// Sistema de almacenamiento con Supabase
import { supabase, supabaseAdmin } from './supabase'

export interface Process {
  id: string
  numero_causa: string
  actor: string
  cedula_actor?: string
  correo_actor?: string
  abogado_actor?: string
  correo_abogado_actor?: string
  demandado: string
  cedula_demandado?: string
  correo_demandado?: string
  abogado_demandado?: string
  correo_abogado_demandado?: string
  materia: string
  asunto: string
  lugar: string
  juez_id: string
  juez?: User
  estado: 'activo' | 'acumulado' | 'archivado' | 'concluido'
  fecha_creacion: string
  fecha_actualizacion: string
  acumulado_a?: string
  es_acumulado: boolean
  expedientes?: Expediente[]
}

export interface Expediente {
  id: string
  proceso_id: string
  numero_expediente: number
  instancia: 'primera' | 'segunda' | 'tercera'
  estado: 'activo' | 'archivado' | 'concluido'
  fecha_creacion: string
  actividades?: Actividad[]
}

export interface Actividad {
  id: string
  expediente_id: string
  tipo: 'providencia' | 'razon' | 'escrito' | 'otros'
  titulo: string
  contenido: string
  archivo_url?: string
  creado_por: string
  fecha_creacion: string
  despachado?: boolean
  fecha_despacho?: string
  despachado_por?: string
  metadata?: Record<string, any>
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'juez' | 'secretario' | 'abogado' | 'tercero'
  created_at: string
  updated_at: string
}

// Funciones para procesos
export const getProcesses = async (): Promise<Process[]> => {
  try {
    const { data, error } = await supabase
      .from('processes')
      .select(`
        *,
        juez:users(*)
      `)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error fetching processes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getProcesses:', error)
    return []
  }
}

export const searchProcesses = async (searchTerm: string): Promise<Process[]> => {
  try {
    const { data, error } = await supabase
      .from('processes')
      .select(`
        *,
        juez:users(*)
      `)
      .or(`numero_causa.ilike.%${searchTerm}%,actor.ilike.%${searchTerm}%,demandado.ilike.%${searchTerm}%,asunto.ilike.%${searchTerm}%,materia.ilike.%${searchTerm}%`)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error searching processes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in searchProcesses:', error)
    return []
  }
}

export const getProcessById = async (id: string): Promise<Process | null> => {
  try {
    const { data, error } = await supabase
      .from('processes')
      .select(`
        *,
        juez:users(*),
        expedientes:expedientes(
          *,
          actividades:actividades(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching process:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getProcessById:', error)
    return null
  }
}

export const createProcess = async (processData: Omit<Process, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Process | null> => {
  try {
    // Generar número de causa automáticamente
    const year = new Date().getFullYear()
    const { data: lastProcess } = await supabase
      .from('processes')
      .select('numero_causa')
      .like('numero_causa', `13999-${year}-%`)
      .order('numero_causa', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1
    if (lastProcess) {
      const lastNumber = parseInt(lastProcess.numero_causa.split('-')[2])
      nextNumber = lastNumber + 1
    }

    const numero_causa = `13999-${year}-${nextNumber.toString().padStart(5, '0')}`

    const { data, error } = await supabase
      .from('processes')
      .insert({
        ...processData,
        numero_causa,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      })
      .select(`
        *,
        juez:users(*)
      `)
      .single()

    if (error) {
      console.error('Error creating process:', error)
      return null
    }

    // Crear expediente inicial
    await supabase
      .from('expedientes')
      .insert({
        proceso_id: data.id,
        numero_expediente: 1,
        instancia: 'primera',
        estado: 'activo',
        fecha_creacion: new Date().toISOString()
      })

    return data
  } catch (error) {
    console.error('Error in createProcess:', error)
    return null
  }
}

export const updateProcess = async (id: string, updates: Partial<Process>): Promise<Process | null> => {
  try {
    const { data, error } = await supabase
      .from('processes')
      .update({
        ...updates,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        juez:users(*)
      `)
      .single()

    if (error) {
      console.error('Error updating process:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateProcess:', error)
    return null
  }
}

export const deleteProcess = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('processes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting process:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteProcess:', error)
    return false
  }
}

// Funciones para actividades
export const createActivity = async (activityData: Omit<Actividad, 'id' | 'fecha_creacion'>): Promise<Actividad | null> => {
  try {
    const { data, error } = await supabase
      .from('actividades')
      .insert({
        ...activityData,
        fecha_creacion: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createActivity:', error)
    return null
  }
}

export const getActivitiesByExpediente = async (expedienteId: string): Promise<Actividad[]> => {
  try {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error fetching activities:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getActivitiesByExpediente:', error)
    return []
  }
}

// Funciones para usuarios
export const getUsers = async (): Promise<User[]> => {
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

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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

// Función para inicializar datos de ejemplo
export const initializeSampleData = async (): Promise<void> => {
  try {
    // Verificar si ya hay datos
    const { data: existingProcesses } = await supabase
      .from('processes')
      .select('id')
      .limit(1)

    if (existingProcesses && existingProcesses.length > 0) {
      console.log('Sample data already exists')
      return
    }

    // Crear usuarios de ejemplo
    const users = [
      { email: 'admin@satje.com', name: 'Administrador', role: 'admin' as const },
      { email: 'juez1@satje.com', name: 'Dr. Juan Pérez', role: 'juez' as const },
      { email: 'juez2@satje.com', name: 'Dra. María García', role: 'juez' as const },
      { email: 'secretario1@satje.com', name: 'Carlos López', role: 'secretario' as const },
      { email: 'abogado1@satje.com', name: 'Ana Martínez', role: 'abogado' as const }
    ]

    for (const user of users) {
      await createUser(user)
    }

    console.log('Sample data initialized successfully')
  } catch (error) {
    console.error('Error initializing sample data:', error)
  }
}
