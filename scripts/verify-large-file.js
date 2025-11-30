const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLargeUpload() {
    console.log('1. Fetching an expediente...');
    const { data: expedientes } = await supabase.from('expedientes').select('id').limit(1);
    if (!expedientes || expedientes.length === 0) return;
    const expedienteId = expedientes[0].id;

    console.log('1.5 Fetching a user...');
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) return;
    const userId = users[0].id;

    console.log('2. Creating activity with 6MB dummy PDF...');
    // Create a string > 6MB
    const largeString = 'a'.repeat(6 * 1024 * 1024);
    const dummyPdfBase64 = `data:application/pdf;base64,${Buffer.from(largeString).toString('base64')}`;

    const payload = {
        expediente_id: expedienteId,
        tipo: 'escrito',
        titulo: 'TEST LARGE UPLOAD',
        contenido: 'This is a large file test',
        archivo_url: dummyPdfBase64,
        creado_por: userId,
        metadata: {
            test: true,
            archivo_info: {
                nombre: 'large.pdf',
                tipo: 'application/pdf',
                tamaño: 6 * 1024 * 1024
            }
        }
    };

    try {
        const response = await fetch('http://localhost:3000/api/activities/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.log(`Server response: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.log('Response body:', text);
        } else {
            const result = await response.json();
            console.log('Success! Activity created (Backend accepted large file):', result.id);
        }

    } catch (e) {
        console.error('Upload failed:', e.message);
    }
}

testLargeUpload();
