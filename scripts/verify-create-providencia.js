
// const fetch = require('node-fetch'); // Native fetch in Node 18+

const API_URL = 'http://localhost:3000/api';

async function verifyCreateProvidencia() {
    console.log('Starting Create Providencia Verification...');

    try {
        // 1. Fetch a process to link the providencia to
        console.log('\n1. Fetching a process...');
        const searchResponse = await fetch(`${API_URL}/processes/search?t=${Date.now()}`);
        if (!searchResponse.ok) throw new Error(`Failed to search processes: ${searchResponse.status}`);
        const processes = await searchResponse.json();

        if (processes.length === 0) throw new Error('No processes found');

        const process = processes[0];
        const expediente = process.expedientes[0];

        console.log(`   Using Process: ${process.numero_causa} (${process.id})`);
        console.log(`   Using Expediente: ${expediente.id}`);

        // 2. Create an "Autonomous" Providencia (not linked to a writing)
        console.log('\n2. Creating Autonomous Providencia...');
        const providenciaTitle = `Autonomous Providencia ${Date.now()}`;

        const providenciaData = {
            expediente_id: expediente.id,
            tipo: 'providencia',
            titulo: providenciaTitle,
            contenido: 'Content of the autonomous providencia',
            creado_por: '87378ed6-75ad-4a91-80ee-ee9dfd7169d0', // Known Admin ID
            fecha_creacion: new Date().toISOString(),
            metadata: {
                tipo_providencia: 'auto_tramite', // Example type
                numero_causa: process.numero_causa,
                es_autonoma: true // Flag to indicate it's autonomous (though backend might not strictly require it, it helps tracking)
            }
        };

        const createResponse = await fetch(`${API_URL}/activities/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(providenciaData)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Failed to create providencia: ${createResponse.status} - ${errorText}`);
        }

        const newProvidencia = await createResponse.json();
        console.log(`   Providencia Created: ${newProvidencia.id}`);

        // 3. Verify the providencia exists in the process
        console.log('\n3. Verifying providencia visibility...');
        const verifyResponse = await fetch(`${API_URL}/processes/search?t=${Date.now()}`);
        if (!verifyResponse.ok) throw new Error(`Failed to fetch processes for verification: ${verifyResponse.status}`);
        const updatedProcesses = await verifyResponse.json();

        let foundProvidencia = null;
        for (const p of updatedProcesses) {
            for (const e of p.expedientes || []) {
                const found = e.actividades?.find(a => a.id === newProvidencia.id);
                if (found) {
                    foundProvidencia = found;
                    break;
                }
            }
            if (foundProvidencia) break;
        }

        if (foundProvidencia) {
            console.log('   ✅ Providencia found in database!');
            console.log(`   Title: ${foundProvidencia.titulo}`);
            if (foundProvidencia.titulo === providenciaTitle) {
                console.log('   ✅ Title matches.');
            } else {
                console.error('   ❌ Title mismatch!');
            }
        } else {
            throw new Error('Providencia NOT found in database after creation');
        }

        console.log('\n✅ VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

verifyCreateProvidencia();
