const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUpload() {
    console.log('1. Fetching an expediente...');
    const { data: expedientes, error: searchError } = await supabase
        .from('expedientes')
        .select('id')
        .limit(1);

    if (searchError || !expedientes || expedientes.length === 0) {
        console.error('Error finding expediente:', searchError);
        return;
    }

    const expedienteId = expedientes[0].id;
    console.log('Found expediente:', expedienteId);

    console.log('1.5 Fetching a user...');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('Error finding user:', userError);
        return;
    }
    const userId = users[0].id;
    console.log('Found user:', userId);

    console.log('2. Creating activity with base64 PDF...');
    const dummyPdfBase64 = 'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogCjw8CiAgL1R5cGUgL1BhZ2VzCiAgL01lZGlhQm94IFsgMCAwIDIwMCAyMDAgXQogIC9Db3VudCAxCiAgL0tpZHMgWyAzIDAgUiBdCj4+CmVuZG9iagoKMyAwIG9iago8PAogIC9UeXBlIC9QYWdlCiAgL1BhcmVudCAyIDAgUHIKICAvUmVzb3VyY2VzIDw8CiAgICAvRm9udCA8PAogICAgICAvRjEgNCAwIFIKICAgID4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTEKICAvQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKNSAwIG9iago8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDE1NyAwMDAwMCBuIAowMDAwMDAwMjU1IDAwMDAwIG4gCjAwMDAwMDAzNDQgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCiUlRU9GCg==';

    const payload = {
        expediente_id: expedienteId,
        tipo: 'escrito',
        titulo: 'TEST PDF UPLOAD',
        contenido: 'This is a test upload from verification script',
        archivo_url: dummyPdfBase64,
        creado_por: userId,
        metadata: {
            test: true,
            archivo_info: {
                nombre: 'test.pdf',
                tipo: 'application/pdf'
            }
        }
    };

    // We can call the API or insert directly. Calling the API tests the route logic.
    // Since we are running in a script, we can just use fetch to localhost:3000
    try {
        const response = await fetch('http://localhost:3000/api/activities/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Error: ${response.status} - ${text}`);
        }

        const result = await response.json();
        console.log('Success! Activity created:', result.id);
        console.log('Archivo URL stored (first 50 chars):', result.archivo_url.substring(0, 50) + '...');

    } catch (e) {
        console.error('Upload failed:', e);
    }
}

testUpload();
