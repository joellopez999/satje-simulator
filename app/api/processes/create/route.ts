import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const requestData = await request.json()

        console.log('API Route: Creating process with data:', requestData)
        console.log('Service Role Key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
        console.log('Service Role Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length)

        // Separate expedientes from process data
        const { expedientes, ...processData } = requestData

        // Insert process into Supabase (without expedientes field)
        const { data: createdProcess, error: processError } = await supabaseAdmin
            .from('procesos')
            .insert([processData])
            .select()
            .single()

        if (processError) {
            console.error('Error creating process:', processError)
            console.error('Process data sent:', JSON.stringify(processData, null, 2))
            return NextResponse.json(
                { error: processError.message, details: processError },
                { status: 400 }
            )
        }

        // If expedientes are provided, insert them
        if (expedientes && expedientes.length > 0) {
            // Remove actividades field as it's a separate table, not a column
            const expedientesWithProcessId = expedientes.map((exp: any) => {
                const { actividades, ...expedienteData } = exp
                return {
                    ...expedienteData,
                    proceso_id: createdProcess.id
                }
            })

            const { data: createdExpedientes, error: expedientesError } = await supabaseAdmin
                .from('expedientes')
                .insert(expedientesWithProcessId)
                .select()

            if (expedientesError) {
                console.error('Error creating expedientes:', expedientesError)
                // Process was created but expedientes failed - return error
                return NextResponse.json(
                    { error: 'Process created but expedientes failed', details: expedientesError },
                    { status: 500 }
                )
            }

            console.log('Expedientes created successfully:', createdExpedientes)
        }

        console.log('Process created successfully:', createdProcess)
        return NextResponse.json({ success: true, data: createdProcess }, { status: 201 })

    } catch (error) {
        console.error('Unexpected error in process creation:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
