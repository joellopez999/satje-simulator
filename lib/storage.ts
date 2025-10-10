// Sistema de almacenamiento local para desarrollo
// En producción esto se reemplazaría con Supabase

export interface Process {
  id: string
  numero_causa: string
  actor: string
  demandado: string
  materia: string
  asunto: string
  lugar: string
  juez_id: string
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
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Almacenamiento en localStorage para desarrollo
const STORAGE_KEYS = {
  PROCESSES: 'satje_processes',
  USERS: 'satje_users',
  ACTIVITIES: 'satje_activities',
  SYNC_KEY: 'satje_sync_key'
}

// Función para sincronizar datos entre navegadores
const syncData = () => {
  if (typeof window === 'undefined') return
  
  const syncKey = localStorage.getItem(STORAGE_KEYS.SYNC_KEY)
  if (!syncKey) {
    // Primera vez en este navegador, crear clave única
    const newSyncKey = `satje_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(STORAGE_KEYS.SYNC_KEY, newSyncKey)
  }
}

// Función para limpiar y reinicializar datos (útil para desarrollo)
export const resetStorage = () => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(STORAGE_KEYS.PROCESSES)
  localStorage.removeItem(STORAGE_KEYS.USERS)
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES)
  localStorage.removeItem(STORAGE_KEYS.SYNC_KEY)
  
  console.log('Datos de SATJE reinicializados')
}

// Funciones para procesos
export const getProcesses = (): Process[] => {
  if (typeof window === 'undefined') return []
  
  // Sincronizar datos
  syncData()
  
  const stored = localStorage.getItem(STORAGE_KEYS.PROCESSES)
  if (!stored) {
    // Solo inicializar si no hay datos existentes
    const hasAnyData = localStorage.getItem(STORAGE_KEYS.USERS) || 
                      localStorage.getItem(STORAGE_KEYS.ACTIVITIES)
    
    if (hasAnyData) {
      // Si hay otros datos pero no procesos, retornar array vacío
      return []
    }
    
    // Datos iniciales de ejemplo (solo se crean una vez)
    const initialProcesses: Process[] = [
      {
        id: '1',
        numero_causa: '13999-2025-00123',
        actor: 'Juan Pérez',
        cedula_actor: '1234567890',
        correo_actor: 'juan.perez@email.com',
        abogado_actor: 'Dr. Carlos López',
        correo_abogado_actor: 'carlos.lopez@abogado.com',
        demandado: 'María González',
        cedula_demandado: '0987654321',
        correo_demandado: 'maria.gonzalez@email.com',
        abogado_demandado: 'Dra. Ana Martínez',
        correo_abogado_demandado: 'ana.martinez@abogado.com',
        materia: 'Civil',
        asunto: 'Demanda de pago de salarios',
        lugar: 'Portoviejo, Manabí',
        juez_id: '1',
        juez: 'Dr. Carlos López',
        estado: 'activo',
        fecha_creacion: '2025-01-15T10:00:00Z',
        fecha_actualizacion: '2025-01-15T10:00:00Z',
        es_acumulado: false,
        expedientes: [
          {
            id: '1-1',
            proceso_id: '1',
            numero_expediente: 1,
            instancia: 'primera',
            estado: 'activo',
            fecha_creacion: '2025-01-15T10:00:00Z',
            actividades: [
              {
                id: '1-1-1',
                expediente_id: '1-1',
                tipo: 'escrito',
                titulo: 'Demanda inicial',
                contenido: 'Se presenta demanda de pago de salarios contra la demandada...',
                creado_por: 'Abg. Ana Martínez',
                fecha_creacion: '2025-01-15T10:00:00Z'
              },
              {
                id: '1-1-2',
                expediente_id: '1-1',
                tipo: 'providencia',
                titulo: 'Auto de admisión',
                contenido: 'Se admite a trámite la demanda presentada...',
                creado_por: 'Dr. Carlos López',
                fecha_creacion: '2025-01-16T14:30:00Z'
              }
            ]
          }
        ]
      },
      {
        id: '2',
        numero_causa: '13999-2025-00124',
        actor: 'Carlos López',
        cedula_actor: '1122334455',
        correo_actor: 'carlos.lopez@email.com',
        abogado_actor: 'Dr. Roberto Silva',
        correo_abogado_actor: 'roberto.silva@abogado.com',
        demandado: 'Ana Martínez',
        cedula_demandado: '5566778899',
        correo_demandado: 'ana.martinez@email.com',
        abogado_demandado: 'Dra. Carmen Vega',
        correo_abogado_demandado: 'carmen.vega@abogado.com',
        materia: 'Penal',
        asunto: 'Robo',
        lugar: 'Manta, Manabí',
        juez_id: '2',
        juez: 'Dra. María González',
        estado: 'activo',
        fecha_creacion: '2025-01-16T14:30:00Z',
        fecha_actualizacion: '2025-01-16T14:30:00Z',
        es_acumulado: false,
        expedientes: [
          {
            id: '2-1',
            proceso_id: '2',
            numero_expediente: 1,
            instancia: 'primera',
            estado: 'activo',
            fecha_creacion: '2025-01-16T14:30:00Z',
            actividades: [
              {
                id: '2-1-1',
                expediente_id: '2-1',
                tipo: 'escrito',
                titulo: 'Denuncia penal',
                contenido: 'Se presenta denuncia por el delito de robo...',
                creado_por: 'Abg. Pedro Ramírez',
                fecha_creacion: '2025-01-16T14:30:00Z'
              }
            ]
          }
        ]
      }
    ]
    localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(initialProcesses))
    return initialProcesses
  }
  
  return JSON.parse(stored)
}

export const saveProcess = (process: Process): Process => {
  const processes = getProcesses()
  const existingIndex = processes.findIndex(p => p.id === process.id)
  
  if (existingIndex >= 0) {
    processes[existingIndex] = { ...process, fecha_actualizacion: new Date().toISOString() }
  } else {
    processes.push({ ...process, fecha_actualizacion: new Date().toISOString() })
  }
  
  localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(processes))
  return process
}

export const updateProcess = (processId: string, updateData: Partial<Process>): Process => {
  const processes = getProcesses()
  const processIndex = processes.findIndex(p => p.id === processId)
  
  if (processIndex === -1) {
    throw new Error('Proceso no encontrado')
  }
  
  const updatedProcess = {
    ...processes[processIndex],
    ...updateData,
    fecha_actualizacion: new Date().toISOString()
  }
  
  processes[processIndex] = updatedProcess
  localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(processes))
  
  return updatedProcess
}

export const deleteProcess = (processId: string): void => {
  const processes = getProcesses()
  const filteredProcesses = processes.filter(p => p.id !== processId)
  
  if (filteredProcesses.length === processes.length) {
    throw new Error('Proceso no encontrado')
  }
  
  localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(filteredProcesses))
}

export const createProcess = (processData: Omit<Process, 'id' | 'numero_causa' | 'fecha_creacion' | 'fecha_actualizacion' | 'es_acumulado'>): Process => {
  const processes = getProcesses()
  const year = new Date().getFullYear()
  
  // Generar número secuencial
  const existingThisYear = processes.filter(p => p.numero_causa.includes(`-${year}-`))
  const nextNumber = existingThisYear.length + 1
  
  const numero_causa = `13999-${year}-${nextNumber.toString().padStart(5, '0')}`
  
  const newProcess: Process = {
    id: Date.now().toString(),
    numero_causa,
    ...processData,
    estado: 'activo',
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    es_acumulado: false,
    expedientes: [
      {
        id: `${Date.now()}-1`,
        proceso_id: Date.now().toString(),
        numero_expediente: 1,
        instancia: 'primera',
        estado: 'activo',
        fecha_creacion: new Date().toISOString(),
        actividades: []
      }
    ]
  }
  
  return saveProcess(newProcess)
}

export const searchProcesses = (filters: {
  numero_causa?: string
  materia?: string
  fecha_desde?: string
  fecha_hasta?: string
  juez_id?: string
  estado?: string
}): Process[] => {
  let processes = getProcesses()
  
  if (filters.numero_causa) {
    processes = processes.filter(p => 
      p.numero_causa.toLowerCase().includes(filters.numero_causa!.toLowerCase())
    )
  }
  
  if (filters.materia) {
    processes = processes.filter(p => p.materia === filters.materia)
  }
  
  if (filters.estado) {
    processes = processes.filter(p => p.estado === filters.estado)
  }
  
  if (filters.fecha_desde) {
    processes = processes.filter(p => p.fecha_creacion >= filters.fecha_desde!)
  }
  
  if (filters.fecha_hasta) {
    processes = processes.filter(p => p.fecha_creacion <= filters.fecha_hasta!)
  }
  
  if (filters.juez_id) {
    processes = processes.filter(p => p.juez_id === filters.juez_id)
  }
  
  return processes.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
}

export const getPendingWritings = (): any[] => {
  const processes = getProcesses()
  const allWritings: any[] = []

  processes.forEach(process => {
    if (process.expedientes) {
      process.expedientes.forEach(expediente => {
        expediente.actividades.forEach(actividad => {
          if (actividad.tipo === 'escrito' && !actividad.despachado) {
            allWritings.push({
              ...actividad,
              proceso: process,
              expediente: expediente
            })
          }
        })
      })
    }
  })

  return allWritings.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
}

export const markWritingAsDispatched = (actividadId: string, despachadoPor: string): boolean => {
  const processes = getProcesses()
  
  for (let i = 0; i < processes.length; i++) {
    const process = processes[i]
    if (process.expedientes) {
      for (let j = 0; j < process.expedientes.length; j++) {
        const expediente = process.expedientes[j]
        const actividadIndex = expediente.actividades.findIndex(a => a.id === actividadId)
        
        if (actividadIndex !== -1) {
          expediente.actividades[actividadIndex].despachado = true
          expediente.actividades[actividadIndex].fecha_despacho = new Date().toISOString()
          expediente.actividades[actividadIndex].despachado_por = despachadoPor
          
          // Actualizar fecha de actualización del proceso
          processes[i].fecha_actualizacion = new Date().toISOString()
          
          // Guardar en localStorage
          localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(processes))
          return true
        }
      }
    }
  }
  
  return false
}

export const createActivity = (activityData: Omit<Actividad, 'id'>): Actividad => {
  const processes = getProcesses()
  const newActivity: Actividad = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...activityData
  }

  // Encontrar el proceso y expediente correspondiente
  const procesoIndex = processes.findIndex(p => p.id === activityData.metadata?.proceso_id)
  if (procesoIndex === -1) {
    throw new Error('Proceso no encontrado')
  }

  const expedienteIndex = processes[procesoIndex].expedientes?.findIndex(
    e => e.id === activityData.expediente_id
  )
  if (expedienteIndex === -1 || !processes[procesoIndex].expedientes) {
    throw new Error('Expediente no encontrado')
  }

  // Agregar la actividad al expediente
  processes[procesoIndex].expedientes[expedienteIndex].actividades.push(newActivity)
  
  // Actualizar la fecha de actualización del proceso
  processes[procesoIndex].fecha_actualizacion = new Date().toISOString()

  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(processes))
  
  return newActivity
}

// Funciones para usuarios
export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEYS.USERS)
  if (!stored) {
    const initialUsers: User[] = [
      {
        id: '1',
        email: 'admin@satje.com',
        name: 'Administrador SATJE',
        role: 'admin',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: '2',
        email: 'juez1@judicatura.gob.ec',
        name: 'Dr. Carlos López',
        role: 'juez',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: '3',
        email: 'juez2@judicatura.gob.ec',
        name: 'Dra. María González',
        role: 'juez',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      },
      {
        id: '4',
        email: 'tercero@ejemplo.com',
        name: 'Perito Juan Pérez',
        role: 'tercero',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    ]
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers))
    return initialUsers
  }
  
  return JSON.parse(stored)
}

export const saveUser = (user: User): User => {
  const users = getUsers()
  const existingIndex = users.findIndex(u => u.id === user.id)
  
  if (existingIndex >= 0) {
    users[existingIndex] = { ...user, updated_at: new Date().toISOString() }
  } else {
    users.push({ ...user, updated_at: new Date().toISOString() })
  }
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  return user
}
