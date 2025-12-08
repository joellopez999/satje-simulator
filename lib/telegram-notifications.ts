// Utilidades para notificaciones de Telegram
export interface TelegramNotification {
  type: 'nueva_actividad' | 'solicitud_completada' | 'nuevo_proceso' | 'recordatorio'
  titulo: string
  descripcion: string
  proceso_id?: string
  expediente_id?: string
  usuario: string
  fecha: string
  url?: string
}

export interface TelegramConfig {
  botToken: string
  chatId: string
  n8nWebhookUrl?: string
}

// Configuración por defecto
const defaultConfig: TelegramConfig = {
  botToken: '8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs',
  chatId: '', // Se configurará dinámicamente
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || ''
}

// Función para enviar notificación a N8N
export const sendTelegramNotification = async (
  notification: TelegramNotification,
  config: Partial<TelegramConfig> = {}
): Promise<{ success: boolean; error?: string }> => {
  try {
    const finalConfig = { ...defaultConfig, ...config }

    // Si hay webhook de N8N, usar ese método
    if (finalConfig.n8nWebhookUrl) {
      const response = await fetch(finalConfig.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notification,
          botToken: finalConfig.botToken,
          chatId: finalConfig.chatId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    }

    // Método directo con Telegram API
    const telegramMessage = formatTelegramMessage(notification)

    const response = await fetch(`https://api.telegram.org/bot${finalConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: finalConfig.chatId,
        text: telegramMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.description || 'Error sending message')
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Formatear mensaje para Telegram
const formatTelegramMessage = (notification: TelegramNotification): string => {
  const emoji = getEmojiForType(notification.type)
  const timestamp = new Date(notification.fecha).toLocaleString('es-EC')

  let message = `${emoji} <b>${notification.titulo}</b>\n\n`
  message += `${notification.descripcion}\n\n`
  message += `👤 <b>Usuario:</b> ${notification.usuario}\n`
  message += `📅 <b>Fecha:</b> ${timestamp}\n`

  if (notification.proceso_id) {
    message += `📋 <b>Proceso:</b> ${notification.proceso_id}\n`
  }

  if (notification.url) {
    message += `🔗 <a href="${notification.url}">Ver detalles</a>\n`
  }

  return message
}

// Obtener emoji según tipo de notificación
const getEmojiForType = (type: TelegramNotification['type']): string => {
  switch (type) {
    case 'nueva_actividad':
      return '📝'
    case 'solicitud_completada':
      return '✅'
    case 'nuevo_proceso':
      return '⚖️'
    case 'recordatorio':
      return '⏰'
    default:
      return '🔔'
  }
}

// Funciones específicas para diferentes tipos de notificaciones
export const notifyNuevaActividad = async (
  actividad: {
    titulo: string
    contenido: string
    usuario: string
    proceso_id: string
    expediente_id: string
  },
  config?: Partial<TelegramConfig>
) => {
  return sendTelegramNotification({
    type: 'nueva_actividad',
    titulo: 'Nueva Actividad Creada',
    descripcion: `Se ha creado una nueva actividad: "${actividad.titulo}"`,
    proceso_id: actividad.proceso_id,
    expediente_id: actividad.expediente_id,
    usuario: actividad.usuario,
    fecha: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/proceso/${actividad.proceso_id}`
  }, config)
}

export const notifySolicitudCompletada = async (
  solicitud: {
    titulo: string
    usuario: string
    proceso_id: string
    numero_causa?: string
  },
  config?: Partial<TelegramConfig>
) => {
  const procesoInfo = solicitud.numero_causa ? ` - Proceso: ${solicitud.numero_causa}` : ''
  return sendTelegramNotification({
    type: 'solicitud_completada',
    titulo: 'Solicitud Completada',
    descripcion: `Se ha completado la solicitud: "${solicitud.titulo}"${procesoInfo}`,
    proceso_id: solicitud.numero_causa || solicitud.proceso_id, // Use numero_causa if available for display
    usuario: solicitud.usuario,
    fecha: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/proceso/${solicitud.proceso_id}`
  }, config)
}

export const notifyNuevoProceso = async (
  proceso: {
    numero_causa: string
    actor: string
    materia: string
    usuario: string
    proceso_id: string
  },
  config?: Partial<TelegramConfig>
) => {
  return sendTelegramNotification({
    type: 'nuevo_proceso',
    titulo: 'Nuevo Proceso Creado',
    descripcion: `Se ha creado un nuevo proceso ${proceso.numero_causa} - ${proceso.actor} (${proceso.materia})`,
    proceso_id: proceso.proceso_id,
    usuario: proceso.usuario,
    fecha: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/proceso/${proceso.proceso_id}`
  }, config)
}

export const notifyRecordatorio = async (
  recordatorio: {
    titulo: string
    descripcion: string
    proceso_id: string
    fecha_limite: string
  },
  config?: Partial<TelegramConfig>
) => {
  return sendTelegramNotification({
    type: 'recordatorio',
    titulo: 'Recordatorio de Plazo',
    descripcion: `${recordatorio.descripcion}\n\n⏰ Fecha límite: ${new Date(recordatorio.fecha_limite).toLocaleString('es-EC')}`,
    proceso_id: recordatorio.proceso_id,
    usuario: 'Sistema',
    fecha: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/proceso/${recordatorio.proceso_id}`
  }, config)
}
