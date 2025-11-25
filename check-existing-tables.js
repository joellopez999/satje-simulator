// Script para verificar qué tablas existen en Supabase
const { createClient } = require('@supabase/supabase-js')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Verificando tablas existentes en Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NO CONFIGURADA')

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkExistingTables() {
  try {
    console.log('\n📡 Probando conexión básica...')
    
    // Probar conexión básica
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Error:', error.message)
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 La tabla "users" no existe')
        await checkOtherTables()
        return
      }
      
      if (error.message.includes('Invalid API key')) {
        console.log('🔑 Error: Clave API inválida')
        return
      }
      
      return
    }
    
    console.log('✅ Tabla "users" existe!')
    await checkTableData('users')
    
  } catch (error) {
    console.log('💥 Error inesperado:', error.message)
  }
}

async function checkOtherTables() {
  console.log('\n🔍 Verificando otras tablas comunes...')
  
  const commonTables = [
    'user_passwords',
    'activity_logs',
    'profiles',
    'auth.users',
    'public.users',
    'processes',
    'cases',
    'documents'
  ]
  
  for (const tableName of commonTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ Tabla "${tableName}": No existe`)
        } else {
          console.log(`⚠️  Tabla "${tableName}": Error - ${error.message}`)
        }
      } else {
        console.log(`✅ Tabla "${tableName}": Existe`)
        await checkTableData(tableName)
      }
    } catch (error) {
      console.log(`💥 Error verificando "${tableName}":`, error.message)
    }
  }
}

async function checkTableData(tableName) {
  try {
    console.log(`\n📊 Verificando datos en "${tableName}"...`)
    
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(5)
    
    if (error) {
      console.log(`❌ Error obteniendo datos de "${tableName}":`, error.message)
      return
    }
    
    console.log(`✅ Registros en "${tableName}": ${count || data.length}`)
    
    if (data && data.length > 0) {
      console.log('📋 Estructura de la tabla:')
      const firstRow = data[0]
      Object.keys(firstRow).forEach(key => {
        const value = firstRow[key]
        const type = typeof value
        const sample = type === 'string' ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : value
        console.log(`   - ${key}: ${type} = ${sample}`)
      })
      
      console.log('\n📋 Primeros registros:')
      data.forEach((row, index) => {
        console.log(`   ${index + 1}.`, row)
      })
    }
    
  } catch (error) {
    console.log(`💥 Error verificando datos de "${tableName}":`, error.message)
  }
}

async function checkSupabaseInfo() {
  try {
    console.log('\n🔍 Información del proyecto Supabase...')
    
    // Intentar obtener información del proyecto
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
    
    if (error) {
      console.log('❌ No se pudo obtener información del esquema:', error.message)
      return
    }
    
    if (data && data.length > 0) {
      console.log('📋 Tablas en el esquema público:')
      data.forEach(table => {
        console.log(`   - ${table.table_schema}.${table.table_name}`)
      })
    } else {
      console.log('⚠️  No se encontraron tablas en el esquema público')
    }
    
  } catch (error) {
    console.log('💥 Error obteniendo información del esquema:', error.message)
  }
}

async function main() {
  console.log('🚀 VERIFICANDO TABLAS EXISTENTES EN SUPABASE')
  console.log('=' .repeat(60))
  
  await checkExistingTables()
  await checkSupabaseInfo()
  
  console.log('\n📋 RESUMEN:')
  console.log('=' .repeat(30))
  console.log('✅ Conexión con Supabase: OK')
  console.log('🔍 Revisa la lista de tablas arriba para ver qué existe')
  console.log('💡 Si no hay tablas, ejecuta el script supabase-setup.sql')
}

main().catch(console.error)







