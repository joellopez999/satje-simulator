// Script completo de verificación de Supabase
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno desde .env.local si existe
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    })
    
    console.log('✅ Archivo .env.local cargado')
  } else {
    console.log('⚠️  Archivo .env.local no encontrado')
  }
}

// Cargar variables de entorno
loadEnvFile()

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verificando configuración de Supabase...')
console.log('URL:', supabaseUrl || 'NO CONFIGURADA')
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NO CONFIGURADA')

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
  console.log('\n❌ Configuración incompleta!')
  console.log('📝 Pasos para configurar:')
  console.log('1. Crea un archivo .env.local en la raíz del proyecto')
  console.log('2. Agrega las credenciales de Supabase:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima')
  console.log('3. Ejecuta este script nuevamente')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('\n📡 Probando conexión básica...')
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
      return false
    }
    
    console.log('✅ Conexión exitosa!')
    return true
  } catch (error) {
    console.log('💥 Error inesperado:', error.message)
    return false
  }
}

async function testTables() {
  console.log('\n🗄️  Verificando tablas...')
  
  const tables = [
    { name: 'users', description: 'Usuarios del sistema' },
    { name: 'user_passwords', description: 'Contraseñas de usuarios' },
    { name: 'activity_logs', description: 'Logs de actividad' }
  ]
  
  const results = []
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Tabla "${table.name}": ${error.message}`)
        results.push({ table: table.name, status: 'error', message: error.message })
      } else {
        console.log(`✅ Tabla "${table.name}": OK`)
        results.push({ table: table.name, status: 'ok', message: 'Tabla existe' })
      }
    } catch (error) {
      console.log(`💥 Error en tabla "${table.name}":`, error.message)
      results.push({ table: table.name, status: 'error', message: error.message })
    }
  }
  
  return results
}

async function testUsers() {
  console.log('\n👥 Verificando usuarios...')
  
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Error obteniendo usuarios:', error.message)
      return false
    }
    
    console.log(`✅ Usuarios encontrados: ${users.length}`)
    
    if (users.length > 0) {
      console.log('\n📋 Lista de usuarios:')
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
      })
    } else {
      console.log('⚠️  No hay usuarios en la base de datos')
      console.log('💡 Ejecuta el script SQL de inicialización')
    }
    
    return true
  } catch (error) {
    console.log('💥 Error verificando usuarios:', error.message)
    return false
  }
}

async function testPasswords() {
  console.log('\n🔐 Verificando contraseñas...')
  
  try {
    const { data: passwords, error } = await supabase
      .from('user_passwords')
      .select('*')
      .limit(5)
    
    if (error) {
      console.log('❌ Error obteniendo contraseñas:', error.message)
      return false
    }
    
    console.log(`✅ Contraseñas encontradas: ${passwords.length}`)
    
    if (passwords.length > 0) {
      console.log('📋 Contraseñas configuradas:')
      passwords.forEach((pwd, index) => {
        const maskedPassword = pwd.password.substring(0, 3) + '***'
        console.log(`   ${index + 1}. Usuario ID: ${pwd.user_id} - Contraseña: ${maskedPassword} (Temporal: ${pwd.is_temporary})`)
      })
    } else {
      console.log('⚠️  No hay contraseñas configuradas')
    }
    
    return true
  } catch (error) {
    console.log('💥 Error verificando contraseñas:', error.message)
    return false
  }
}

async function testAuthentication() {
  console.log('\n🔑 Probando autenticación...')
  
  try {
    // Probar con usuario admin
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@satje.ec')
      .single()
    
    if (adminError) {
      console.log('❌ Error obteniendo usuario admin:', adminError.message)
      return false
    }
    
    if (!adminUser) {
      console.log('⚠️  Usuario admin no encontrado')
      return false
    }
    
    console.log('✅ Usuario admin encontrado:', adminUser.name)
    
    // Probar validación de contraseña
    const { data: passwordData, error: passwordError } = await supabase
      .from('user_passwords')
      .select('password')
      .eq('user_id', adminUser.id)
      .single()
    
    if (passwordError) {
      console.log('❌ Error obteniendo contraseña:', passwordError.message)
      return false
    }
    
    if (passwordData && passwordData.password === 'admin123') {
      console.log('✅ Contraseña del admin verificada correctamente')
    } else {
      console.log('⚠️  Contraseña del admin no coincide')
    }
    
    return true
  } catch (error) {
    console.log('💥 Error en autenticación:', error.message)
    return false
  }
}

async function testActivityLogs() {
  console.log('\n📊 Verificando logs de actividad...')
  
  try {
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5)
    
    if (error) {
      console.log('❌ Error obteniendo logs:', error.message)
      return false
    }
    
    console.log(`✅ Logs encontrados: ${logs.length}`)
    
    if (logs.length > 0) {
      console.log('📋 Últimos logs:')
      logs.forEach((log, index) => {
        const timestamp = new Date(log.timestamp).toLocaleString()
        console.log(`   ${index + 1}. [${timestamp}] ${log.user_name} - ${log.action}`)
      })
    }
    
    return true
  } catch (error) {
    console.log('💥 Error verificando logs:', error.message)
    return false
  }
}

async function generateReport(results) {
  console.log('\n📋 REPORTE DE VERIFICACIÓN')
  console.log('=' .repeat(50))
  
  const totalTests = results.length
  const passedTests = results.filter(r => r.status === 'ok').length
  const failedTests = results.filter(r => r.status === 'error').length
  
  console.log(`Total de pruebas: ${totalTests}`)
  console.log(`✅ Exitosas: ${passedTests}`)
  console.log(`❌ Fallidas: ${failedTests}`)
  
  if (failedTests > 0) {
    console.log('\n❌ Pruebas fallidas:')
    results.filter(r => r.status === 'error').forEach(result => {
      console.log(`   - ${result.test}: ${result.message}`)
    })
  }
  
  console.log('\n' + '=' .repeat(50))
  
  if (failedTests === 0) {
    console.log('🎉 ¡Todas las pruebas pasaron! El sistema está listo.')
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa la configuración.')
  }
}

// Función principal
async function main() {
  console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA DE SUPABASE')
  console.log('=' .repeat(60))
  
  const results = []
  
  // Prueba de conexión
  const connectionOk = await testConnection()
  results.push({ test: 'Conexión', status: connectionOk ? 'ok' : 'error', message: connectionOk ? 'Conectado' : 'Error de conexión' })
  
  if (!connectionOk) {
    await generateReport(results)
    return
  }
  
  // Pruebas de tablas
  const tableResults = await testTables()
  results.push(...tableResults.map(r => ({ test: `Tabla ${r.table}`, status: r.status, message: r.message })))
  
  // Pruebas de usuarios
  const usersOk = await testUsers()
  results.push({ test: 'Usuarios', status: usersOk ? 'ok' : 'error', message: usersOk ? 'Usuarios verificados' : 'Error con usuarios' })
  
  // Pruebas de contraseñas
  const passwordsOk = await testPasswords()
  results.push({ test: 'Contraseñas', status: passwordsOk ? 'ok' : 'error', message: passwordsOk ? 'Contraseñas verificadas' : 'Error con contraseñas' })
  
  // Pruebas de autenticación
  const authOk = await testAuthentication()
  results.push({ test: 'Autenticación', status: authOk ? 'ok' : 'error', message: authOk ? 'Autenticación OK' : 'Error de autenticación' })
  
  // Pruebas de logs
  const logsOk = await testActivityLogs()
  results.push({ test: 'Logs', status: logsOk ? 'ok' : 'error', message: logsOk ? 'Logs verificados' : 'Error con logs' })
  
  // Generar reporte
  await generateReport(results)
}

main().catch(console.error)







