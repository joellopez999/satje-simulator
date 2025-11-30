import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { actividadId, despachadoPor } = body

        if (!actividadId || !despachadoPor) {
            return NextResponse.json(
                { error: 'Missing required fields: actividadId, despachadoPor' },
                { status: 400 }
            )
        }

        // 1. Fetch existing metadata
        const { data: currentData, error: fetchError } = await supabaseAdmin
            .from('actividades')
            .select('metadata')
            .eq('id', actividadId)
            .single()

        if (fetchError) {
            console.error('Error fetching activity for dispatch:', fetchError)
            return NextResponse.json(
                { error: 'Activity not found' },
                { status: 404 }
            )
        }

        const currentMetadata = currentData?.metadata || {}

        // 2. Prepare new metadata
        const newMetadata = {
            ...currentMetadata,
            despachado: true,
            despachado_por: despachadoPor,
            fecha_despacho: new Date().toISOString()
        }

        // 3. Update activity
        const { error: updateError } = await supabaseAdmin
            .from('actividades')
            .update({
                metadata: newMetadata
            })
            .eq('id', actividadId)

        if (updateError) {
            console.error('Error marking writing as dispatched:', updateError)
            return NextResponse.json(
                { error: 'Failed to update activity' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error in dispatch route:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
