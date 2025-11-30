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
  juez_id?: string
  juez?: string
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
  actividades: Actividad[]
}

export interface Actividad {
  id: string
  expediente_id: string
  tipo: 'providencia' | 'razon' | 'escrito' | 'otros'
  titulo: string
  contenido: string
  archivo_url?: string
  creado_por?: string
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
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Funciones para procesos
export const getProcesses = async (): Promise<Process[]> => {
  const { data, error } = await supabase
    .from('procesos')
    .select(`
      *,
      expedientes (
        *,
        actividades (*)
      )
    `)
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error fetching processes:', error)
    return []
  }

  return data as Process[]
}

export const saveProcess = async (process: Partial<Process>): Promise<Process | null> => {
  // Prepare process data for insertion (exclude nested objects)
  const { expedientes, ...processData } = process as any

  if (process.id && !process.id.startsWith('proc-')) {
    // Update existing
    const { data, error } = await supabaseAdmin
      .from('procesos')
      .update({ ...processData, fecha_actualizacion: new Date().toISOString() })
      .eq('id', process.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Create new - use supabaseAdmin to bypass RLS
    // Remove temporary ID if it exists
    const { id, ...newProcessData } = processData

    const { data, error } = await supabaseAdmin
      .from('procesos')
      .insert([{ ...newProcessData, fecha_creacion: new Date().toISOString(), fecha_actualizacion: new Date().toISOString() }])
      .select()
      .single()

    if (error) throw error

    // Create initial expediente if needed
    if (data && expedientes && expedientes.length > 0) {
      const exp = expedientes[0]
      await supabaseAdmin.from('expedientes').insert({
        proceso_id: data.id,
        numero_expediente: exp.numero_expediente,
        instancia: exp.instancia,
        estado: exp.estado,
        fecha_creacion: new Date().toISOString()
      })
    }

    return data
  }
}

export const updateProcess = async (processId: string, updateData: Partial<Process>): Promise<Process | null> => {
  const { data, error } = await supabase
    .from('procesos')
    .update({ ...updateData, fecha_actualizacion: new Date().toISOString() })
    .eq('id', processId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteProcess = async (processId: string): Promise<void> => {
  const { error } = await supabase
    .from('procesos')
    .delete()
    .eq('id', processId)

  if (error) throw error
}

export const searchProcesses = async (filters: {
  numero_causa?: string
  materia?: string
  fecha_desde?: string
  fecha_hasta?: string
  juez_id?: string
  estado?: string
  abogado_email?: string
  abogado_name?: string
}): Promise<Process[]> => {
  let query = supabase
    .from('procesos')
    .select(`
      *,
      expedientes (
        *,
        actividades (*)
      )
    `)

  if (filters.numero_causa) {
    query = query.ilike('numero_causa', `%${filters.numero_causa}%`)
  }

  if (filters.materia) {
    query = query.eq('materia', filters.materia)
  }

  if (filters.estado) {
    query = query.eq('estado', filters.estado)
  }

  if (filters.fecha_desde) {
    query = query.gte('fecha_creacion', filters.fecha_desde)
  }

  if (filters.fecha_hasta) {
    query = query.lte('fecha_creacion', filters.fecha_hasta)
  }

  if (filters.juez_id) {
    query = query.eq('juez_id', filters.juez_id)
  }

  // Note: Complex filtering like lawyer email/name might need to be done client-side 
  // or via more complex joins if not directly on the process table.
  // For now, we'll return the results and let the client filter complex relations if needed,
  // or assume these fields are denormalized on the process table as per the interface.

  const { data, error } = await query.order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error searching processes:', error)
    return []
  }

  return data as Process[]
}

export const getPendingWritings = async (): Promise<any[]> => {
  // This is a bit complex because we need to filter nested activities.
  // Supabase doesn't support filtering nested arrays easily in one go.
  // We'll fetch processes with their activities and filter in memory for now,
  // or we could query the 'actividades' table directly if we join back to process.

  const { data, error } = await supabase
    .from('actividades')
    .select(`
      *,
      expediente:expedientes (
        *,
        proceso:procesos (*)
      )
    `)
    .eq('tipo', 'escrito')
    //.eq('despachado', false) // Assuming 'despachado' column exists or is in metadata
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error('Error fetching pending writings:', error)
    return []
  }

  // Filter for non-dispatched writings based on metadata or column
  return data.filter((activity: any) => {
    // Check metadata or specific column if it exists
    return !activity.metadata?.despachado && !activity.despachado
  }).map((activity: any) => ({
    ...activity,
    proceso: activity.expediente?.proceso,
    expediente: activity.expediente
  }))
}

export const markWritingAsDispatched = async (actividadId: string, despachadoPor: string): Promise<boolean> => {
  // First fetch existing metadata to avoid overwriting
  const { data: currentData, error: fetchError } = await supabase
    .from('actividades')
    .select('metadata')
    .eq('id', actividadId)
    .single()

  if (fetchError) {
    console.error('Error fetching activity for dispatch:', fetchError)
    return false
  }

  const currentMetadata = currentData?.metadata || {}
  const newMetadata = {
    ...currentMetadata,
    despachado: true,
    despachado_por: despachadoPor,
    fecha_despacho: new Date().toISOString()
  }

  const { error } = await supabase
    .from('actividades')
    .update({
      metadata: newMetadata
    })
    .eq('id', actividadId)

  if (error) {
    console.error('Error marking writing as dispatched:', error)
    return false
  }
  return true
}

export const createActivity = async (activityData: Omit<Actividad, 'id' | 'fecha_creacion'>): Promise<Actividad | null> => {
  // console.error('WARNING: createActivity called. This should be migrated to API route.')
  console.log('Creating activity with data:', activityData)
  const { data, error } = await supabaseAdmin
    .from('actividades')
    .insert([{
      ...activityData,
      fecha_creacion: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating activity:', error)
    throw error
  }
  return data
}

export const createExpediente = async (expediente: Omit<Expediente, 'id' | 'fecha_creacion' | 'actividades'>): Promise<Expediente | null> => {
  const { data, error } = await supabase
    .from('expedientes')
    .insert([{
      ...expediente,
      fecha_creacion: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating expediente:', error)
    throw error
  }
  return data
}

// Funciones para usuarios
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  return data as User[]
}

export const saveUser = async (user: Partial<User>): Promise<User | null> => {
  // Use admin client to upsert the user, bypassing RLS policies.
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert([user], { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('Error upserting user:', error)
    throw error
  }
  return data as User
}
