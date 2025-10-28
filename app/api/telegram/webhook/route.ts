import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram-notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar que sea una notificación válida
    if (!body.type || !body.titulo || !body.descripcion) {
      return NextResponse.json(
        { error: 'Datos de notificación incompletos' },
        { status: 400 }
      )
    }

    // Enviar notificación
    const result = await sendTelegramNotification(body)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notificación enviada exitosamente' 
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error en webhook de Telegram:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook de Telegram activo',
    bot: 'satjesimulatorbot',
    status: 'ready'
  })
}
