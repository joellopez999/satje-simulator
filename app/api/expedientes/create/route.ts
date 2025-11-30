
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Use admin client to bypass RLS
        const { data, error } = await supabaseAdmin
            .from('expedientes')
            .insert([{
                ...body,
                fecha_creacion: new Date().toISOString()
            }])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error creating expediente:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
