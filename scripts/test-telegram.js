#!/usr/bin/env node

// Script para probar las notificaciones de Telegram
const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'TU_BOT_TOKEN_AQUI';
const CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || 'TU_CHAT_ID_AQUI';

// Función para enviar mensaje de prueba
function sendTestMessage() {
  const message = `🤖 <b>SATJE Simulator - Prueba de Notificación</b>

✅ <b>Bot configurado correctamente</b>
📱 <b>Chat ID:</b> ${CHAT_ID}
🔧 <b>Token:</b> ${BOT_TOKEN.substring(0, 10)}...

📝 <b>Tipos de notificaciones disponibles:</b>
• Nueva Actividad (📝)
• Solicitud Completada (✅)
• Nuevo Proceso (⚖️)
• Recordatorio (⏰)

🚀 <b>Sistema listo para recibir notificaciones</b>`;

  const data = JSON.stringify({
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        if (response.ok) {
          console.log('✅ Mensaje enviado exitosamente!');
          console.log(`📱 Chat ID: ${response.result.chat.id}`);
          console.log(`📝 Mensaje ID: ${response.result.message_id}`);
        } else {
          console.error('❌ Error enviando mensaje:', response.description);
        }
      } catch (error) {
        console.error('❌ Error parseando respuesta:', error.message);
        console.log('Respuesta raw:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
  });

  req.write(data);
  req.end();
}

// Función para probar webhook de la aplicación
function testWebhook() {
  const webhookData = {
    type: 'nueva_actividad',
    titulo: 'Prueba de Notificación',
    descripcion: 'Esta es una notificación de prueba desde SATJE Simulator',
    proceso_id: 'test-123',
    usuario: 'Sistema de Pruebas',
    fecha: new Date().toISOString(),
    url: 'https://satje-simulator.vercel.app/proceso/test-123'
  };

  console.log('🔗 Datos del webhook:');
  console.log(JSON.stringify(webhookData, null, 2));
  console.log('\n📋 Para probar el webhook, ejecuta:');
  console.log(`curl -X POST https://satje-simulator.vercel.app/api/telegram/webhook \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '${JSON.stringify(webhookData)}'`);
}

console.log('🤖 SATJE Simulator - Prueba de Telegram');
console.log('=====================================\n');

console.log('📱 Enviando mensaje de prueba...');
sendTestMessage();

console.log('\n🔗 Información del webhook:');
testWebhook();

console.log('\n✅ Configuración completada!');
console.log('📋 Variables de entorno necesarias:');
console.log(`TELEGRAM_BOT_TOKEN=${BOT_TOKEN}`);
console.log(`NEXT_PUBLIC_TELEGRAM_CHAT_ID=${CHAT_ID}`);
console.log('N8N_WEBHOOK_URL=tu_n8n_webhook_url');
