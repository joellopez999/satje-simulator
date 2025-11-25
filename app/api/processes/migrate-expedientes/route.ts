import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * API endpoint para migrar procesos sin expedientes
 * GET /api/processes/migrate-expedientes
 */
export async function GET() {
    try {
        console.log('🔍 Iniciando migración de expedientes...')

        // 1. Obtener todos los procesos
        const { data: allProcesses, error: processesError } = await supabaseAdmin
            .from('procesos')
            .select('id, numero_causa, fecha_creacion')
            .order('fecha_creacion', { ascending: true })

        if (processesError) {
            console.error('Error obteniendo procesos:', processesError)
            return NextResponse.json(
                { error: processesError.message },
                { status: 400 }
            )
        }

        // 2. Obtener todos los expedientes existentes
        const { data: allExpedientes, error: expedientesError } = await supabaseAdmin
            .from('expedientes')
            .select('proceso_id')

        if (expedientesError) {
            console.error('Error obteniendo expedientes:', expedientesError)
            return NextResponse.json(
                { error: expedientesError.message },
                { status: 400 }
            )
        }

        // 3. Crear un Set de proceso_ids que ya tienen expedientes
        const processIdsWithExpedientes = new Set(
            allExpedientes?.map(exp => exp.proceso_id) || []
        )

        // 4. Filtrar procesos sin expedientes
        const processesWithoutExpedientes = allProcesses?.filter(
            proceso => !processIdsWithExpedientes.has(proceso.id)
        ) || []

        console.log(`Procesos sin expedientes: ${processesWithoutExpedientes.length}`)

        if (processesWithoutExpedientes.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Todos los procesos ya tienen expedientes',
                totalProcesses: allProcesses?.length || 0,
                processesWithoutExpedientes: 0,
                expedientesCreated: 0
            })
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

        // 6. Insertar expedientes en batch
        const { data: createdExpedientes, error: insertError } = await supabaseAdmin
            .from('expedientes')
            .insert(expedientesToCreate)
            .select()

        if (insertError) {
            console.error('Error creando expedientes:', insertError)
            return NextResponse.json(
                { error: insertError.message, details: insertError },
                { status: 500 }
            )
        }

        console.log(`✅ Expedientes creados: ${createdExpedientes?.length || 0}`)

        return NextResponse.json({
            success: true,
            message: 'Migración completada exitosamente',
            totalProcesses: allProcesses?.length || 0,
            processesWithoutExpedientes: processesWithoutExpedientes.length,
            expedientesCreated: createdExpedientes?.length || 0,
            processesFixed: processesWithoutExpedientes.map(p => p.numero_causa)
        })

    } catch (error) {
        console.error('Error inesperado en migración:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
