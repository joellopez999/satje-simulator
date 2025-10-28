// Sistema de almacenamiento simple para desarrollo
export interface Process {
  id: string
  numero_causa: string
  actor: string
  demandado: string
  materia: string
  asunto: string
  lugar: string
  juez_id: string
  estado: 'activo' | 'acumulado' | 'archivado' | 'concluido'
  fecha_creacion: string
  fecha_actualizacion: string
  es_acumulado: boolean
  expedientes?: Expediente[]
}

export interface Expediente {
  id: string
  proceso_id: string
  numero_expediente: number
  instancia: 'primera' | 'segunda' | 'tercera' // primera = PRIMER NIVEL, segunda = SEGUNDO NIVEL, tercera = TERCER NIVEL
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
  creado_por: string
  fecha_creacion: string
  despachado?: boolean
  fecha_despacho?: string
  despachado_por?: string
  metadata?: Record<string, any>
}

// Claves para localStorage
const STORAGE_KEYS = {
  PROCESSES: 'satje_processes',
  ACTIVITIES: 'satje_activities',
  USERS: 'satje_users',
}

// Datos iniciales de ejemplo
const initialProcesses: Process[] = [
  {
    id: '1',
    numero_causa: '13999-2025-00001',
    actor: 'Juan Pérez',
    demandado: 'María García',
    materia: 'Civil',
    asunto: 'Demanda de pago por deuda',
    lugar: 'Quito',
    juez_id: 'juez1',
    estado: 'activo',
    fecha_creacion: new Date('2025-01-15T10:00:00Z').toISOString(),
    fecha_actualizacion: new Date('2025-01-15T10:00:00Z').toISOString(),
    es_acumulado: false,
    expedientes: [
      {
        id: 'exp1-1',
        proceso_id: '1',
        numero_expediente: 1,
        instancia: 'primera',
        estado: 'activo',
        fecha_creacion: new Date('2025-01-15T10:00:00Z').toISOString(),
        actividades: []
      }
    ]
  },
  {
    id: '2',
    numero_causa: '13999-2025-00002',
    actor: 'Carlos López',
    demandado: 'Ana Martínez',
    materia: 'Penal',
    asunto: 'Robo con fuerza en las cosas',
    lugar: 'Guayaquil',
    juez_id: 'juez2',
    estado: 'activo',
    fecha_creacion: new Date('2025-02-20T11:30:00Z').toISOString(),
    fecha_actualizacion: new Date('2025-02-20T11:30:00Z').toISOString(),
    es_acumulado: false,
    expedientes: [
      {
        id: 'exp2-1',
        proceso_id: '2',
        numero_expediente: 1,
        instancia: 'primera',
        estado: 'activo',
        fecha_creacion: new Date('2025-02-20T11:30:00Z').toISOString(),
        actividades: []
      }
    ]
  },
  {
    id: '3',
    numero_causa: '13999-2025-00003',
    actor: 'Sofía Rivera',
    demandado: 'Pedro Delgado',
    materia: 'Laboral',
    asunto: 'Despido intempestivo',
    lugar: 'Cuenca',
    juez_id: 'juez3',
    estado: 'activo',
    fecha_creacion: new Date('2025-03-10T09:15:00Z').toISOString(),
    fecha_actualizacion: new Date('2025-03-10T09:15:00Z').toISOString(),
    es_acumulado: false,
    expedientes: [
      {
        id: 'exp3-1',
        proceso_id: '3',
        numero_expediente: 1,
        instancia: 'primera',
        estado: 'activo',
        fecha_creacion: new Date('2025-03-10T09:15:00Z').toISOString(),
        actividades: []
      }
    ]
  }
]

export const getProcesses = (): Process[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROCESSES)
    if (stored) {
      const parsed = JSON.parse(stored) as Process[]
      return parsed
    }
  } catch (error) {
    console.error('Error parsing stored processes:', error)
  }

  // Si no hay datos o hay error, inicializar con datos de ejemplo
  localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(initialProcesses))
  return initialProcesses
}

export const searchProcesses = (searchTerm: string): Process[] => {
  const allProcesses = getProcesses()
  if (!searchTerm) return allProcesses
  
  const searchLower = searchTerm.toLowerCase()
  return allProcesses.filter(process => 
    process.numero_causa.toLowerCase().includes(searchLower) ||
    process.actor.toLowerCase().includes(searchLower) ||
    process.demandado.toLowerCase().includes(searchLower) ||
    process.asunto.toLowerCase().includes(searchLower) ||
    process.materia.toLowerCase().includes(searchLower)
  )
}

export const createActivity = (activityData: Omit<Actividad, 'id' | 'fecha_creacion'>): Actividad => {
  const newActivity: Actividad = {
    ...activityData,
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fecha_creacion: new Date().toISOString()
  }
  
  // Buscar el proceso y expediente correspondiente
  const allProcesses = getProcesses()
  const processIndex = allProcesses.findIndex(p => p.expedientes?.some(e => e.id === activityData.expediente_id))
  
  if (processIndex !== -1) {
    const expedienteIndex = allProcesses[processIndex].expedientes!.findIndex(e => e.id === activityData.expediente_id)
    
    if (expedienteIndex !== -1) {
      allProcesses[processIndex].expedientes![expedienteIndex].actividades.push(newActivity)
      localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(allProcesses))
    }
  }
  
  console.log('Activity created:', newActivity)
  return newActivity
}

export const saveProcess = (process: Process): void => {
  const allProcesses = getProcesses()
  const existingIndex = allProcesses.findIndex(p => p.id === process.id)
  
  if (existingIndex !== -1) {
    allProcesses[existingIndex] = process
  } else {
    allProcesses.push(process)
  }
  
  localStorage.setItem(STORAGE_KEYS.PROCESSES, JSON.stringify(allProcesses))
}