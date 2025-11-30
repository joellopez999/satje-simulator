
import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const body = await request.json()

        // Use admin client to bypass RLS if needed, or ensure user has permission
        const { data, error } = await supabaseAdmin
            .from('procesos')
            .update({
                ...body,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error updating process:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id

        // Use admin client to bypass RLS
        const { error } = await supabaseAdmin
            .from('procesos')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting process:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
