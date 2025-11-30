
const API_URL = 'http://localhost:3000/api';

async function verifySecretaryActions() {
    console.log('Starting Secretary Actions Verification...');

    try {
        // 1. Fetch a process to link the action to
        console.log('\n1. Fetching a process...');
        const searchResponse = await fetch(`${API_URL}/processes/search?t=${Date.now()}`);
        if (!searchResponse.ok) throw new Error(`Failed to search processes: ${searchResponse.status}`);
        const processes = await searchResponse.json();

        if (processes.length === 0) throw new Error('No processes found');

        const process = processes[0];
        const expediente = process.expedientes[0];

        console.log(`   Using Process: ${process.numero_causa} (${process.id})`);
        console.log(`   Using Expediente: ${expediente.id}`);

        // 2. Create a Secretary Action (Razón)
        console.log('\n2. Creating Secretary Action (Razón)...');
        const actionTitle = `Secretary Action Test ${Date.now()}`;

        const actionData = {
            expediente_id: expediente.id,
            tipo: 'razon',
            titulo: actionTitle,
            contenido: 'Content of the secretary action (razón)',
            creado_por: '87378ed6-75ad-4a91-80ee-ee9dfd7169d0', // Known Admin ID
            fecha_creacion: new Date().toISOString(),
            metadata: {
                tipo_actuacion: 'Razón',
                proceso_id: process.id,
                es_secretaria: true,
                usuario_creador: {
                    id: '87378ed6-75ad-4a91-80ee-ee9dfd7169d0',
                    nombre: 'Secretario Test',
                    rol: 'secretario'
                }
            }
        };

        const createResponse = await fetch(`${API_URL}/activities/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actionData)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Failed to create action: ${createResponse.status} - ${errorText}`);
        }

        const newAction = await createResponse.json();
        console.log(`   Action Created: ${newAction.id}`);

        // 3. Verify the action exists in the process
        console.log('\n3. Verifying action visibility...');
        const verifyResponse = await fetch(`${API_URL}/processes/search?t=${Date.now()}`);
        if (!verifyResponse.ok) throw new Error(`Failed to fetch processes for verification: ${verifyResponse.status}`);
        const updatedProcesses = await verifyResponse.json();

        let foundAction = null;
        for (const p of updatedProcesses) {
            for (const e of p.expedientes || []) {
                const found = e.actividades?.find(a => a.id === newAction.id);
                if (found) {
                    foundAction = found;
                    break;
                }
            }
            if (foundAction) break;
        }

        if (foundAction) {
            console.log('   ✅ Action found in database!');
            console.log(`   Title: ${foundAction.titulo}`);
            console.log(`   Type: ${foundAction.tipo}`);

            if (foundAction.titulo === actionTitle && foundAction.tipo === 'razon') {
                console.log('   ✅ Title and Type match.');
            } else {
                console.error('   ❌ Data mismatch!');
            }
        } else {
            throw new Error('Action NOT found in database after creation');
        }

        console.log('\n✅ VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

verifySecretaryActions();
