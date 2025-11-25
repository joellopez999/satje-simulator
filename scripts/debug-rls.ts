import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('--- Key Verification ---')
console.log('Service Role Key defined:', !!supabaseServiceRoleKey)
console.log('Anon Key defined:', !!supabaseAnonKey)
console.log('Service Role Key start:', supabaseServiceRoleKey?.substring(0, 10))
console.log('Anon Key start:', supabaseAnonKey?.substring(0, 10))
console.log('Keys are different:', supabaseServiceRoleKey !== supabaseAnonKey)
console.log('Service Role Key length:', supabaseServiceRoleKey?.length)
console.log('Anon Key length:', supabaseAnonKey?.length)

if (supabaseServiceRoleKey === supabaseAnonKey) {
    console.error('CRITICAL: Service Role Key is identical to Anon Key! RLS bypass will NOT work.')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

async function debugRLS() {
    console.log('\n--- RLS Policy Check ---')

    // Check RLS status for actividades
    const { data: policies, error } = await supabaseAdmin
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'actividades')

    if (error) {
        // pg_policies might not be accessible via API if not exposed, but let's try
        console.log('Could not fetch policies via API (expected if not exposed):', error.message)
    } else {
        console.log('Policies for actividades:', policies)
    }

    console.log('\n--- Test Insert with Admin Client ---')
    const testActivity = {
        expediente_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID, might fail FK but should pass RLS
        tipo: 'otros',
        titulo: 'Test Activity',
        contenido: 'Debug insert',
        fecha_creacion: new Date().toISOString(),
        creado_por: '87378ed6-75ad-4a91-80ee-ee9dfd7169d0' // Admin user ID
    }

    const { data, error: insertError } = await supabaseAdmin
        .from('actividades')
        .insert([testActivity])
        .select()

    if (insertError) {
        console.error('Insert failed:', insertError)
        if (insertError.code === '23503') {
            console.log('Foreign Key violation (expected for dummy ID), but RLS passed!')
        } else if (insertError.message.includes('row-level security')) {
            console.error('RLS BLOCKED THE INSERT even with Service Role Key!')
        }
    } else {
        console.log('Insert successful (RLS bypassed)!')
        // Cleanup
        await supabaseAdmin.from('actividades').delete().eq('id', data[0].id)
    }
}

debugRLS()
