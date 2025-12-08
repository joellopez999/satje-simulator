import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')
        const type = searchParams.get('type') || 'escrito'

        let query = supabaseAdmin
            .from('actividades')
            .select(`
                *,
                expedientes (
                    id,
                    numero_expediente,
                    instancia,
                    procesos (
                        id,
                        numero_causa,
                        actor,
                        demandado,
                        materia
                    )
                )
            `)
            .eq('tipo', type)
            .order('fecha_creacion', { ascending: false })
            .range(offset, offset + limit - 1)

        const { data, error } = await query

        if (error) {
            console.error('Error fetching recent activities:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error fetching recent activities:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
