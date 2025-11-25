import { createClient } from '@supabase/supabase-js'

// Initialize admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

/**
 * Script para agregar expedientes a procesos que no los tienen
 */
async function migrateProcessesWithoutExpedientes() {
    console.log('🔍 Buscando procesos sin expedientes...')

    try {
        // 1. Obtener todos los procesos
        const { data: allProcesses, error: processesError } = await supabaseAdmin
            .from('procesos')
            .select('id, numero_causa, fecha_creacion')
            .order('fecha_creacion', { ascending: true })

        if (processesError) {
            console.error('❌ Error obteniendo procesos:', processesError)
            return
        }

        console.log(`📊 Total de procesos encontrados: ${allProcesses?.length || 0}`)

        // 2. Obtener todos los expedientes existentes
        const { data: allExpedientes, error: expedientesError } = await supabaseAdmin
            .from('expedientes')
            .select('proceso_id')

        if (expedientesError) {
            console.error('❌ Error obteniendo expedientes:', expedientesError)
            return
        }

        // 3. Crear un Set de proceso_ids que ya tienen expedientes
        const processIdsWithExpedientes = new Set(
            allExpedientes?.map(exp => exp.proceso_id) || []
        )

        // 4. Filtrar procesos sin expedientes
        const processesWithoutExpedientes = allProcesses?.filter(
            proceso => !processIdsWithExpedientes.has(proceso.id)
        ) || []

        console.log(`🔧 Procesos sin expedientes: ${processesWithoutExpedientes.length}`)

        if (processesWithoutExpedientes.length === 0) {
            console.log('✅ Todos los procesos ya tienen expedientes')
            return
        }

        // 5. Crear expedientes para cada proceso
        const expedientesToCreate = processesWithoutExpedientes.map(proceso => ({
            id: crypto.randomUUID(),
            proceso_id: proceso.id,
            numero_expediente: 1,
            instancia: 'primera' as const,
            estado: 'activo' as const,
            fecha_creacion: proceso.fecha_creacion || new Date().toISOString()
        }))

        console.log(`📝 Creando ${expedientesToCreate.length} expedientes...`)

        // 6. Insertar expedientes en batch
        const { data: createdExpedientes, error: insertError } = await supabaseAdmin
            .from('expedientes')
            .insert(expedientesToCreate)
            .select()

        if (insertError) {
            console.error('❌ Error creando expedientes:', insertError)
            return
        }

        console.log(`✅ Expedientes creados exitosamente: ${createdExpedientes?.length || 0}`)

        // 7. Mostrar resumen
        console.log('\n📋 RESUMEN DE MIGRACIÓN:')
        console.log(`   Total de procesos: ${allProcesses?.length || 0}`)
        console.log(`   Procesos sin expedientes: ${processesWithoutExpedientes.length}`)
        console.log(`   Expedientes creados: ${createdExpedientes?.length || 0}`)
        console.log('\n✨ Migración completada exitosamente')

        return {
            success: true,
            totalProcesses: allProcesses?.length || 0,
            processesWithoutExpedientes: processesWithoutExpedientes.length,
            expedientesCreated: createdExpedientes?.length || 0
        }

    } catch (error) {
        console.error('❌ Error inesperado:', error)
        throw error
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    migrateProcessesWithoutExpedientes()
        .then(() => {
            console.log('\n🎉 Script completado')
            process.exit(0)
        })
        .catch((error) => {
            console.error('\n💥 Script falló:', error)
            process.exit(1)
        })
}

export { migrateProcessesWithoutExpedientes }
