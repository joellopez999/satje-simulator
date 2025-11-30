
// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

const API_URL = 'http://localhost:3000/api';

async function verifySecretaryDispatch() {
    console.log('Starting Secretary Dispatch Verification...');

    try {
        // 1. Fetch a process to get valid IDs
        console.log('\n1. Fetching a process...');
        const searchResponse = await fetch(`${API_URL}/processes/search?t=${Date.now()}`);
        if (!searchResponse.ok) throw new Error(`Failed to search processes: ${searchResponse.status}`);
        const processes = await searchResponse.json();

        if (processes.length === 0) throw new Error('No processes found');

        const process = processes[0];
        const expediente = process.expedientes[0];

        console.log(`   Using Process: ${process.numero_causa} (${process.id})`);
        console.log(`   Using Expediente: ${expediente.id}`);

        // 2. Create a Providencia with Secretary Request
        console.log('\n2. Creating Providencia with Secretary Request...');
        const providenciaTitle = `Test Providencia ${Date.now()}`;
        const requestContent = `Please notify the parties ${Date.now()}`;

        // First create the main providencia (simulating the UI flow)
        const providenciaData = {
            expediente_id: expediente.id,
            tipo: 'providencia',
            titulo: providenciaTitle,
            contenido: 'Content of the providencia',
            creado_por: '87378ed6-75ad-4a91-80ee-ee9dfd7169d0', // Known Admin ID
            fecha_creacion: new Date().toISOString(),
            metadata: {
                tipo_providencia: 'auto_tramite',
                numero_causa: process.numero_causa
            }
        };

        const createProvResponse = await fetch(`${API_URL}/activities/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(providenciaData)
        });

        if (!createProvResponse.ok) {
            const errorText = await createProvResponse.text();
            throw new Error(`Failed to create providencia: ${createProvResponse.status} - ${errorText}`);
        }
        const newProvidencia = await createProvResponse.json();
        console.log(`   Providencia Created: ${newProvidencia.id}`);

        // Now create the Secretary Request (Activity of type 'otros')
        const requestData = {
            expediente_id: expediente.id,
            tipo: 'otros',
            titulo: `SOLICITUD A SECRETARÍA: ${providenciaTitle}`,
            contenido: requestContent,
            creado_por: '87378ed6-75ad-4a91-80ee-ee9dfd7169d0', // Known Admin ID
            fecha_creacion: new Date().toISOString(),
            metadata: {
                solicitud_secretaria: true,
                providencia_id: newProvidencia.id,
                titulo_providencia: providenciaTitle,
                proceso_id: process.id,
                numero_causa: process.numero_causa,
                instrucciones: requestContent,
                estado: 'pendiente',
                solicitado_por: 'Test User',
                solicitado_por_id: '87378ed6-75ad-4a91-80ee-ee9dfd7169d0', // Known Admin ID
                fecha_solicitud: new Date().toISOString()
            }
        };

        const createReqResponse = await fetch(`${API_URL}/activities/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!createReqResponse.ok) throw new Error(`Failed to create secretary request: ${createReqResponse.status}`);
        const newRequest = await createReqResponse.json();
        console.log(`   Secretary Request Created: ${newRequest.id}`);

        // 3. Verify the request appears in the "Secretary's Inbox" (simulated fetch)
        console.log('\n3. Verifying request visibility...');
        // We fetch processes again and look for the activity
        const verifyResponse = await fetch(`${API_URL}/processes/search?t=${Date.now()}`);
        if (!verifyResponse.ok) throw new Error(`Failed to fetch processes for verification: ${verifyResponse.status}`);
        const updatedProcesses = await verifyResponse.json();

        let foundRequest = null;
        for (const p of updatedProcesses) {
            for (const e of p.expedientes || []) {
                const found = e.actividades?.find(a => a.id === newRequest.id);
                if (found) {
                    foundRequest = found;
                    break;
                }
            }
            if (foundRequest) break;
        }

        if (foundRequest) {
            console.log('   ✅ Request found in database!');
            console.log(`   Metadata Check: solicitud_secretaria=${foundRequest.metadata.solicitud_secretaria}`);
            console.log(`   Metadata Check: estado=${foundRequest.metadata.estado}`);

            if (foundRequest.metadata.solicitud_secretaria === true && foundRequest.metadata.estado === 'pendiente') {
                console.log('   ✅ Metadata is correct.');
            } else {
                console.error('   ❌ Metadata mismatch!');
            }
        } else {
            throw new Error('Request NOT found in database after creation');
        }

        console.log('\n✅ VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

verifySecretaryDispatch();
