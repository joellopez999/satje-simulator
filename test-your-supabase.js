// Script para probar tu proyecto específico de Supabase
const { createClient } = require('@supabase/supabase-js')

// Tu URL de Supabase
const supabaseUrl = 'https://zriwxjdetsjovxoohkxi.supabase.co'

// NECESITAS REEMPLAZAR ESTA CLAVE CON TU CLAVE ANÓNIMA REAL
const supabaseKey = 'TU_CLAVE_ANONIMA_AQUI'

console.log('🔍 Probando tu proyecto de Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey === 'TU_CLAVE_ANONIMA_AQUI' ? 'NO CONFIGURADA' : supabaseKey.substring(0, 20) + '...')

if (supabaseKey === 'TU_CLAVE_ANONIMA_AQUI') {
  console.log('\n❌ Por favor, reemplaza TU_CLAVE_ANONIMA_AQUI con tu clave anónima real')
  console.log('📝 Puedes encontrarla en: Dashboard → Settings → API → anon public')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testYourProject() {
  try {
    console.log('\n📡 Probando conexión...')
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Error:', error.message)
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n💡 La tabla "users" no existe. Necesitas ejecutar el script SQL de inicialización.')
        console.log('📋 Ejecuta el contenido de supabase-setup.sql en el editor SQL de Supabase')
        return
      }
      
      if (error.message.includes('Invalid API key')) {
        console.log('🔑 Error: Clave API inválida. Verifica tu clave anónima.')
        return
      }
      
      return
    }
    
    console.log('✅ Conexión exitosa!')
    
    // Verificar tablas
    console.log('\n🗄️  Verificando tablas...')
    
    const tables = ['users', 'user_passwords', 'activity_logs']
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
    
    // Verificar usuarios
    console.log('\n👥 Verificando usuarios...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.log('❌ Error obteniendo usuarios:', usersError.message)
    } else {
      console.log(`✅ Usuarios encontrados: ${users.length}`)
      if (users.length > 0) {
        console.log('📋 Usuarios:')
        users.forEach((user, i) => {
          console.log(`   ${i+1}. ${user.name} (${user.email}) - ${user.role}`)
        })
      }
    }
    
    // Verificar contraseñas
    console.log('\n🔐 Verificando contraseñas...')
    const { data: passwords, error: passwordsError } = await supabase
      .from('user_passwords')
      .select('*')
    
    if (passwordsError) {
      console.log('❌ Error obteniendo contraseñas:', passwordsError.message)
    } else {
      console.log(`✅ Contraseñas encontradas: ${passwords.length}`)
    }
    
    console.log('\n🎉 Verificación completada!')
    
  } catch (error) {
    console.log('💥 Error inesperado:', error.message)
  }
}

testYourProject()







