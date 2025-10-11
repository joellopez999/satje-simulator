// Utilidades para manejo de archivos con Supabase Storage
import { supabase } from './supabase'

export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export const uploadFileToSupabase = async (
  file: File,
  bucket: string = 'satje-files',
  folder: string = 'actividades'
): Promise<FileUploadResult> => {
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomId}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error.message
      }
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Error in uploadFileToSupabase:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

export const deleteFileFromSupabase = async (
  filePath: string,
  bucket: string = 'satje-files'
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteFileFromSupabase:', error)
    return false
  }
}

export const getFileUrl = (filePath: string, bucket: string = 'satje-files'): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

// Función para convertir archivo a Base64 (fallback)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Función para validar archivos
export const validateFile = (file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
} = {}): { valid: boolean; error?: string } => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['application/pdf'] } = options

  // Validar tipo de archivo
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Solo se permiten archivos: ${allowedTypes.join(', ')}`
    }
  }

  // Validar tamaño
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1)
    return {
      valid: false,
      error: `El archivo no puede ser mayor a ${maxSizeMB}MB`
    }
  }

  return { valid: true }
}

// Funciones para manejar actividades en Supabase
export interface ActividadData {
  expediente_id: string
  tipo: 'providencia' | 'razon' | 'escrito' | 'otros'
  titulo: string
  contenido?: string
  archivo_url?: string
  creado_por: string
  metadata?: any
}

export const createActividad = async (actividadData: ActividadData) => {
  try {
    const { data, error } = await supabase
      .from('actividades')
      .insert([actividadData])
      .select()

    if (error) {
      console.error('Error creating actividad:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error in createActividad:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export const getActividadesByExpediente = async (expediente_id: string) => {
  try {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('expediente_id', expediente_id)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('Error fetching actividades:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getActividadesByExpediente:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export const updateActividad = async (id: string, updates: Partial<ActividadData>) => {
  try {
    const { data, error } = await supabase
      .from('actividades')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating actividad:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error in updateActividad:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export const deleteActividad = async (id: string) => {
  try {
    const { error } = await supabase
      .from('actividades')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting actividad:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deleteActividad:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}
