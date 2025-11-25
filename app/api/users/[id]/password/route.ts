import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PUT - Update user password
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { password, is_temporary = true } = await request.json()
        const userId = params.id

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            )
        }

        // Check if password exists
        const { data: existing } = await supabaseAdmin
            .from('user_passwords')
            .select('user_id')
            .eq('user_id', userId)
            .single()

        if (existing) {
            // Update existing password
            const { error } = await supabaseAdmin
                .from('user_passwords')
                .update({
                    password,
                    is_temporary,
                    created_at: new Date().toISOString()
                })
                .eq('user_id', userId)

            if (error) {
                console.error('Error updating password:', error)
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                )
            }
        } else {
            // Create new password
            const { error } = await supabaseAdmin
                .from('user_passwords')
                .insert([{
                    user_id: userId,
                    password,
                    is_temporary,
                    created_at: new Date().toISOString()
                }])

            if (error) {
                console.error('Error creating password:', error)
                return NextResponse.json(
                    { error: error.message },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Unexpected error updating password:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET - Get user password
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id

        const { data: passwordData, error } = await supabaseAdmin
            .from('user_passwords')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            // No password found is not an error
            return NextResponse.json({ password: null }, { status: 200 })
        }

        return NextResponse.json({ password: passwordData }, { status: 200 })
    } catch (error) {
        console.error('Unexpected error fetching password:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
