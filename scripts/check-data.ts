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

async function checkData() {
    console.log('Checking processes and expedientes...')

    // Get first 5 processes
    const { data: processes, error: procError } = await supabase
        .from('procesos')
        .select('id, numero_causa')
        .limit(5)

    if (procError) {
        console.error('Error fetching processes:', procError)
        return
    }

    console.log(`Found ${processes.length} processes`)

    for (const p of processes) {
        const { data: expedientes, error: expError } = await supabase
            .from('expedientes')
            .select('id, numero_expediente, instancia')
            .eq('proceso_id', p.id)

        if (expError) {
            console.error(`Error fetching expedientes for process ${p.numero_causa}:`, expError)
        } else {
            console.log(`Process ${p.numero_causa} (${p.id}) has ${expedientes.length} expedientes:`, expedientes)
        }
    }
}

checkData()
