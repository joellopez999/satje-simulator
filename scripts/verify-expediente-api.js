
// const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function verifyExpedienteApi() {
    console.log('Starting Expediente API Verification...');

    // 1. Search for a process to attach the expediente to
    const searchResponse = await fetch(`${BASE_URL}/api/processes/search?numero_causa=2024`);
    const processes = await searchResponse.json();

    if (processes.length === 0) {
        console.log('No processes found. Cannot test expediente creation.');
        return;
    }

    const processId = processes[0].id;
    console.log(`Using Process ID: ${processId}`);

    // 2. Test POST /api/expedientes/create
    console.log('Testing POST /api/expedientes/create...');
    const expedienteData = {
        proceso_id: processId,
        numero_expediente: 99, // Test number
        instancia: 'segunda',
        estado: 'activo'
    };

    const createResponse = await fetch(`${BASE_URL}/api/expedientes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expedienteData)
    });

    if (createResponse.ok) {
        const newExpediente = await createResponse.json();
        console.log('✅ Expediente created successfully:', newExpediente.id);
        console.log('Instancia:', newExpediente.instancia);
    } else {
        console.error('❌ Failed to create expediente:', await createResponse.text());
    }
}

verifyExpedienteApi().catch(console.error);
