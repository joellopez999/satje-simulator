import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { actividadId, userId } = body

        if (!actividadId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: actividadId, userId' },
                { status: 400 }
            )
        }

        // 1. Verify user is admin
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (userError || !user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized: Only admins can delete activities' },
                { status: 403 }
            )
        }

        // 2. Delete activity
        const { error: deleteError } = await supabaseAdmin
            .from('actividades')
            .delete()
            .eq('id', actividadId)

        if (deleteError) {
            console.error('Error deleting activity:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete activity' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error in delete route:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
