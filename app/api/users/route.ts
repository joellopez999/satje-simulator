import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all users
export async function GET() {
    try {
        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching users:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({ users }, { status: 200 })
    } catch (error) {
        console.error('Unexpected error fetching users:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST - Create new user
export async function POST(request: NextRequest) {
    try {
        const { name, email, role, password, is_temporary = true } = await request.json()

        // Validate required fields
        if (!name || !email || !role || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Generate UUID for new user
        const userId = crypto.randomUUID()

        // Insert user into users table
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .insert([{
                id: userId,
                name,
                email,
                role,
                is_active: true,
                created_at: new Date().toISOString()
            }])
            .select()
            .single()

        if (userError) {
            console.error('Error creating user:', userError)
            return NextResponse.json(
                { error: userError.message },
                { status: 400 }
            )
        }

        // Insert password into user_passwords table
        const { error: passwordError } = await supabaseAdmin
            .from('user_passwords')
            .insert([{
                user_id: userId,
                password,
                is_temporary,
                created_at: new Date().toISOString()
            }])

        if (passwordError) {
            console.error('Error creating password:', passwordError)
            // User was created but password failed - delete user to maintain consistency
            await supabaseAdmin.from('users').delete().eq('id', userId)
            return NextResponse.json(
                { error: 'Failed to create password' },
                { status: 400 }
            )
        }

        return NextResponse.json({ user, password }, { status: 201 })
    } catch (error) {
        console.error('Unexpected error creating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
