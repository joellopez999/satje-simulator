// Script de prueba para verificar la conexión con Supabase
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (necesitarás reemplazar con tus credenciales reales)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('🔍 Verificando conexión con Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  try {
    console.log('\n📡 Probando conexión básica...')
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
      
      // Verificar si es un error de tabla no encontrada
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  La tabla "users" no existe. Necesitas crear las tablas primero.')
        console.log('📋 Ejecuta el script de inicialización de base de datos.')
        return false
      }
      
      if (error.message.includes('Invalid API key')) {
        console.log('🔑 Error: Clave API inválida. Verifica tus credenciales de Supabase.')
        return false
      }
      
      if (error.message.includes('Invalid URL')) {
        console.log('🌐 Error: URL inválida. Verifica la URL de tu proyecto Supabase.')
        return false
      }
      
      return false
    }
    
    console.log('✅ Conexión exitosa con Supabase!')
    console.log('📊 Datos recibidos:', data)
    
    // Probar funciones de autenticación
    console.log('\n🔐 Probando funciones de autenticación...')
    
    // Probar obtener usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.log('❌ Error obteniendo usuarios:', usersError.message)
    } else {
      console.log('✅ Usuarios obtenidos exitosamente:', users.length, 'usuarios')
      if (users.length > 0) {
        console.log('👤 Primer usuario:', users[0])
      }
    }
    
    // Probar tabla de contraseñas
    const { data: passwords, error: passwordsError } = await supabase
      .from('user_passwords')
      .select('*')
      .limit(5)
    
    if (passwordsError) {
      console.log('❌ Error obteniendo contraseñas:', passwordsError.message)
    } else {
      console.log('✅ Contraseñas obtenidas exitosamente:', passwords.length, 'registros')
    }
    
    return true
    
  } catch (error) {
    console.log('💥 Error inesperado:', error.message)
    return false
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️  Verificando esquema de base de datos...')
  
  try {
    // Verificar si las tablas existen
    const tables = ['users', 'user_passwords']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Tabla "${table}": ${error.message}`)
      } else {
        console.log(`✅ Tabla "${table}": OK`)
      }
    }
  } catch (error) {
    console.log('💥 Error verificando esquema:', error.message)
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando verificación de Supabase...\n')
  
  const connectionOk = await testSupabaseConnection()
  
  if (connectionOk) {
    await testDatabaseSchema()
    console.log('\n🎉 Verificación completada exitosamente!')
  } else {
    console.log('\n❌ Verificación falló. Revisa la configuración.')
    console.log('\n📝 Pasos para solucionar:')
    console.log('1. Crea un proyecto en https://supabase.com')
    console.log('2. Obtén la URL y clave anónima de tu proyecto')
    console.log('3. Configura las variables de entorno')
    console.log('4. Ejecuta el script de inicialización de base de datos')
  }
}

main().catch(console.error)

