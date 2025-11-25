import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export async function POST(request: Request) {
    console.log('API Route: Starting create activity')

    if (!supabaseServiceRoleKey) {
        console.error('API Route Error: Missing Service Role Key')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    try {
        const activityData = await request.json()
        console.log('API Route: Input Data:', JSON.stringify(activityData, null, 2))

        // Ensure created_at is set
        const dataToInsert = {
            ...activityData,
            fecha_creacion: new Date().toISOString()
        }

        const { data, error } = await supabaseAdmin
            .from('actividades')
            .insert([dataToInsert])
            .select()
            .single()

        if (error) {
            console.error('API Route Supabase Error:', JSON.stringify(error, null, 2))
            return NextResponse.json({ error: error.message, details: error }, { status: 400 })
        }

        console.log('API Route Success:', JSON.stringify(data, null, 2))
        return NextResponse.json(data)
    } catch (error) {
        console.error('API Route Unexpected Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
