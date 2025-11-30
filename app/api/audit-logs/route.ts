
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('user_id')
        const action = searchParams.get('action')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabaseAdmin
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (userId && userId !== 'all') {
            query = query.eq('user_id', userId)
        }

        if (action && action !== 'all') {
            query = query.ilike('action', `%${action}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching audit logs:', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ logs: data, total: count })
    } catch (error) {
        console.error('Internal Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { user_id, action, details, ip_address } = body

        if (!user_id || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                user_id,
                action,
                details,
                ip_address
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating audit log:', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Internal Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
