export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export type UserRole = 'juez' | 'secretario' | 'abogado' | 'tercero' | 'admin'

export interface Process {
  id: string
  numero_causa: string
  actor: string
  cedula_actor: string
  correo_actor: string
  abogado_actor: string
  correo_abogado_actor: string
  demandado: string
  cedula_demandado: string
  correo_demandado: string
  abogado_demandado: string
  correo_abogado_demandado: string
  materia: string
  asunto: string
  lugar: string
  juez_id: string
  juez?: User
  estado: ProcessStatus
  fecha_creacion: string
  fecha_actualizacion: string
  expedientes: Expediente[]
  acumulado_a?: string
  es_acumulado: boolean
}

export type ProcessStatus = 'activo' | 'acumulado' | 'archivado' | 'concluido'

export interface Expediente {
  id: string
  proceso_id: string
  numero_expediente: number
  instancia: Instancia
  estado: ExpedienteStatus
  fecha_creacion: string
  actividades: Actividad[]
}

export type Instancia = 'primera' | 'segunda' | 'tercera'
export type ExpedienteStatus = 'activo' | 'archivado' | 'concluido'

export interface Actividad {
  id: string
  expediente_id: string
  tipo: TipoActividad
  titulo: string
  contenido: string
  archivo_url?: string
  creado_por: string
  creado_por_user?: User
  fecha_creacion: string
  metadata?: Record<string, any>
}

export type TipoActividad = 'providencia' | 'razon' | 'escrito' | 'otros'

export interface CreateProcessData {
  actor: string
  cedula_actor: string
  correo_actor: string
  abogado_actor: string
  correo_abogado_actor: string
  demandado: string
  cedula_demandado: string
  correo_demandado: string
  abogado_demandado: string
  correo_abogado_demandado: string
  materia: string
  asunto: string
  lugar: string
  juez_id: string
}

export interface CreateActividadData {
  expediente_id: string
  tipo: TipoActividad
  titulo: string
  contenido: string
  archivo_url?: string
}

export interface SearchFilters {
  numero_causa?: string
  materia?: string
  fecha_desde?: string
  fecha_hasta?: string
  juez_id?: string
  estado?: ProcessStatus
}
