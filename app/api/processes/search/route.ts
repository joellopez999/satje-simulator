import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const numero_causa = searchParams.get('numero_causa')
        const materia = searchParams.get('materia')
        const estado = searchParams.get('estado')
        const juez_id = searchParams.get('juez_id')

        console.log('API Search Params:', { numero_causa, materia, estado, juez_id })

        let query = supabaseAdmin
            .from('procesos')
            .select(`
        *,
        expedientes (
          *,
          actividades (*)
        )
      `)

        if (numero_causa) {
            query = query.ilike('numero_causa', `%${numero_causa}%`)
        }

        if (materia) {
            query = query.eq('materia', materia)
        }

        if (estado) {
            query = query.eq('estado', estado)
        }

        if (juez_id) {
            query = query.eq('juez_id', juez_id)
        }

        const { data, error } = await query.order('fecha_creacion', { ascending: false })

        if (error) {
            console.error('Error searching processes:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Unexpected error searching processes:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
