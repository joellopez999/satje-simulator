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
    console.log('API Route: Starting upsert user')

    if (!supabaseServiceRoleKey) {
        console.error('API Route Error: Missing Service Role Key')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    try {
        const userData = await request.json()
        console.log('API Route: User Data:', JSON.stringify(userData, null, 2))

        const fullUser = {
            id: userData.id,
            email: userData.email ?? '',
            name: userData.name ?? '',
            role: userData.role ?? 'public',
            is_active: userData.is_active ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabaseAdmin
            .from('users')
            .upsert([fullUser], { onConflict: 'id' })
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
