import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function repairExpedientes() {
    console.log('Checking for processes without expedientes...')

    // Get all processes
    const { data: processes, error: procError } = await supabase
        .from('procesos')
        .select('id, numero_causa')

    if (procError) {
        console.error('Error fetching processes:', procError)
        return
    }

    console.log(`Found ${processes.length} processes total`)

    let fixedCount = 0

    for (const p of processes) {
        // Check if it has expedientes
        const { count, error: countError } = await supabase
            .from('expedientes')
            .select('*', { count: 'exact', head: true })
            .eq('proceso_id', p.id)

        if (countError) {
            console.error(`Error checking expedientes for ${p.numero_causa}:`, countError)
            continue
        }

        if (count === 0) {
            console.log(`Process ${p.numero_causa} (${p.id}) has NO expedientes. Fixing...`)

            const { error: insertError } = await supabase
                .from('expedientes')
                .insert({
                    proceso_id: p.id,
                    numero_expediente: 1,
                    instancia: 'primera',
                    estado: 'activo',
                    fecha_creacion: new Date().toISOString()
                })

            if (insertError) {
                console.error(`Failed to create expediente for ${p.numero_causa}:`, insertError)
            } else {
                console.log(`✅ Created 'Primera Instancia' expediente for ${p.numero_causa}`)
                fixedCount++
            }
        }
    }

    console.log(`\nRepair complete. Fixed ${fixedCount} processes.`)
}

repairExpedientes()
