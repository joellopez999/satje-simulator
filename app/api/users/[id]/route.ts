import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH - Update user
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { name, email, role, is_active } = await request.json()
        const userId = params.id

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (email !== undefined) updateData.email = email
        if (role !== undefined) updateData.role = role
        if (is_active !== undefined) updateData.is_active = is_active

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating user:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
        console.error('Unexpected error updating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id

        // Delete password first (foreign key constraint)
        await supabaseAdmin
            .from('user_passwords')
            .delete()
            .eq('user_id', userId)

        // Delete user
        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId)

        if (error) {
            console.error('Error deleting user:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Unexpected error deleting user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
