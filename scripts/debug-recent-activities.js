const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function debugRecentActivities() {
    console.log('Debugging Recent Activities...');

    // 1. Check total count of activities
    const { count, error: countError } = await supabase
        .from('actividades')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting activities:', countError);
    } else {
        console.log('Total activities in DB:', count);
    }

    // 2. Check activities with type 'escrito'
    const { data: escritos, error: escritosError } = await supabase
        .from('actividades')
        .select('*')
        .eq('tipo', 'escrito')
        .limit(5);

    if (escritosError) {
        console.error('Error fetching raw escritos:', escritosError);
    } else {
        console.log('Sample raw escritos:', escritos ? escritos.length : 0);
        if (escritos && escritos.length > 0) {
            console.log('First escrito:', JSON.stringify(escritos[0], null, 2));
        }
    }

    // 3. Test the complex join query
    console.log('Testing complex join query...');
    const { data: joinData, error: joinError } = await supabase
        .from('actividades')
        .select(`
        *,
        expedientes (
            id,
            numero_expediente,
            instancia,
            procesos (
                id,
                numero_causa,
                actor,
                demandado,
                materia
            )
        )
    `)
        .eq('tipo', 'escrito')
        .order('fecha_creacion', { ascending: false })
        .limit(5);

    if (joinError) {
        console.error('Error executing join query:', joinError);
    } else {
        console.log('Join query results:', joinData ? joinData.length : 0);
        if (joinData && joinData.length > 0) {
            console.log('First result:', JSON.stringify(joinData[0], null, 2));
        } else {
            console.log('No results found with join query.');
        }
    }
}

debugRecentActivities();
