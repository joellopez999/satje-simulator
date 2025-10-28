# 🤖 Configuración Telegram + N8N para SATJE

## 📋 Información del Bot
- **Nombre:** satjesimulatorbot
- **Token:** 8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs

## 🔧 Configuración en N8N

### 1. Crear Workflow en N8N

#### **Nodos Necesarios:**
1. **Webhook** - Para recibir notificaciones de SATJE
2. **Telegram** - Para enviar mensajes
3. **Function** - Para formatear mensajes
4. **Switch** - Para filtrar por tipo de notificación

#### **Configuración del Webhook:**
- **Método:** POST
- **Path:** `/satje-notifications`
- **Autenticación:** None (o API Key si prefieres)

#### **Configuración del Nodo Telegram:**
- **Bot Token:** `8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs`
- **Chat ID:** Configurar dinámicamente desde el webhook
- **Mensaje:** Formateado desde el nodo Function

### 2. Estructura del Webhook

```json
{
  "type": "nueva_actividad" | "solicitud_completada" | "nuevo_proceso" | "recordatorio",
  "titulo": "Título de la notificación",
  "descripcion": "Descripción detallada",
  "proceso_id": "ID del proceso",
  "expediente_id": "ID del expediente",
  "usuario": "Nombre del usuario",
  "fecha": "2024-01-01T10:00:00Z",
  "url": "https://tu-app.com/proceso/123",
  "botToken": "8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs",
  "chatId": "ID del chat de destino"
}
```

### 3. Configuración de Variables de Entorno

#### **En Vercel:**
```bash
TELEGRAM_BOT_TOKEN=8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs
NEXT_PUBLIC_TELEGRAM_CHAT_ID=tu_chat_id_aqui
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/satje-notifications
```

#### **En .env.local:**
```bash
TELEGRAM_BOT_TOKEN=8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs
NEXT_PUBLIC_TELEGRAM_CHAT_ID=tu_chat_id_aqui
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/satje-notifications
```

## 🚀 Uso en la Aplicación

### 1. Obtener Chat ID

Para obtener el Chat ID:
1. Envía un mensaje al bot `@satjesimulatorbot`
2. Visita: `https://api.telegram.org/bot8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs/getUpdates`
3. Busca el `chat.id` en la respuesta

### 2. Configurar N8N

#### **Workflow Básico:**
```
Webhook → Function → Switch → Telegram
```

#### **Nodo Function (Formateo):**
```javascript
// Formatear mensaje para Telegram
const emoji = {
  'nueva_actividad': '📝',
  'solicitud_completada': '✅',
  'nuevo_proceso': '⚖️',
  'recordatorio': '⏰'
}

const message = `${emoji[$input.type]} <b>${$input.titulo}</b>

${$input.descripcion}

👤 <b>Usuario:</b> ${$input.usuario}
📅 <b>Fecha:</b> ${new Date($input.fecha).toLocaleString('es-EC')}
${$input.proceso_id ? `📋 <b>Proceso:</b> ${$input.proceso_id}` : ''}
${$input.url ? `🔗 <a href="${$input.url}">Ver detalles</a>` : ''}`

return {
  chat_id: $input.chatId,
  text: message,
  parse_mode: 'HTML'
}
```

#### **Nodo Switch (Filtros):**
- **Condición 1:** `type === 'nueva_actividad'`
- **Condición 2:** `type === 'solicitud_completada'`
- **Condición 3:** `type === 'nuevo_proceso'`
- **Condición 4:** `type === 'recordatorio'`

## 📱 Tipos de Notificaciones

### 1. Nueva Actividad
- **Trigger:** Cuando se crea una actividad
- **Mensaje:** Información de la actividad creada
- **Emoji:** 📝

### 2. Solicitud Completada
- **Trigger:** Cuando se completa una solicitud de secretaría
- **Mensaje:** Confirmación de completado
- **Emoji:** ✅

### 3. Nuevo Proceso
- **Trigger:** Cuando se crea un nuevo proceso
- **Mensaje:** Información del proceso
- **Emoji:** ⚖️

### 4. Recordatorio
- **Trigger:** Recordatorios de plazos
- **Mensaje:** Información del plazo
- **Emoji:** ⏰

## 🔍 Testing

### 1. Probar Webhook
```bash
curl -X POST https://tu-app.com/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "nueva_actividad",
    "titulo": "Test Notification",
    "descripcion": "Esta es una notificación de prueba",
    "usuario": "Sistema",
    "fecha": "2024-01-01T10:00:00Z"
  }'
```

### 2. Verificar en Telegram
- Revisar que el bot reciba los mensajes
- Verificar formato del mensaje
- Probar diferentes tipos de notificación

## 🛠️ Troubleshooting

### Problemas Comunes:

1. **Bot no responde:**
   - Verificar token del bot
   - Verificar Chat ID
   - Revisar logs de N8N

2. **Mensajes no llegan:**
   - Verificar configuración del webhook
   - Revisar formato del mensaje
   - Verificar permisos del bot

3. **Formato incorrecto:**
   - Revisar nodo Function en N8N
   - Verificar parse_mode: 'HTML'
   - Probar con mensaje simple

## 📞 Soporte

Para problemas con la integración:
1. Revisar logs de la aplicación
2. Verificar configuración de N8N
3. Probar webhook manualmente
4. Verificar variables de entorno
