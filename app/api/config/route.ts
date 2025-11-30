
import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('system_config')
            .select('*')
            .eq('id', 'default')
            .single()

        if (error) {
            // If not found, return default structure (or handle as error)
            if (error.code === 'PGRST116') {
                return NextResponse.json({})
            }
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Upsert configuration
        const { data, error } = await supabaseAdmin
            .from('system_config')
            .upsert({
                id: 'default',
                ...body,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
