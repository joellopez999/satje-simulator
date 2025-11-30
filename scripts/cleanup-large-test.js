const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    console.log('Cleaning up large test activities...');
    const { data, error } = await supabase
        .from('actividades')
        .delete()
        .eq('titulo', 'TEST LARGE UPLOAD')
        .select();

    if (error) {
        console.error('Error cleaning up:', error);
    } else {
        console.log(`Deleted ${data.length} test activities.`);
    }
}

cleanup();
