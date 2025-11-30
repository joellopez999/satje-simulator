
// const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function verifyProcessApi() {
    console.log('Starting Process API Verification...');

    // 1. Create a dummy process (using existing API or direct DB if possible, but let's assume we have one or create one via existing API)
    // For simplicity, we'll try to search for one first.
    console.log('Searching for a process to update...');
    const searchResponse = await fetch(`${BASE_URL}/api/processes/search?numero_causa=2024`);
    if (!searchResponse.ok) {
        console.error('Failed to search processes');
        return;
    }
    const processes = await searchResponse.json();

    if (processes.length === 0) {
        console.log('No processes found to test update. Please create a process first.');
        return;
    }

    const processId = processes[0].id;
    console.log(`Testing with Process ID: ${processId}`);

    // 2. Test PATCH (Update)
    console.log('Testing PATCH /api/processes/[id]...');
    const updateData = {
        estado: 'activo',
        observacion: 'Updated via Verification Script ' + new Date().toISOString()
    };

    const updateResponse = await fetch(`${BASE_URL}/api/processes/${processId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
        const updatedProcess = await updateResponse.json();
        console.log('✅ Process updated successfully:', updatedProcess.id);
        if (updatedProcess.observacion === updateData.observacion) {
            console.log('✅ Observation match verified');
        } else {
            console.error('❌ Observation mismatch');
        }
    } else {
        console.error('❌ Failed to update process:', await updateResponse.text());
    }

    // 3. Test DELETE (Optional - be careful not to delete real data)
    // console.log('Testing DELETE /api/processes/[id]...');
    // const deleteResponse = await fetch(`${BASE_URL}/api/processes/${processId}`, {
    //   method: 'DELETE'
    // });
    // if (deleteResponse.ok) {
    //   console.log('✅ Process deleted successfully');
    // } else {
    //   console.error('❌ Failed to delete process:', await deleteResponse.text());
    // }
}

verifyProcessApi().catch(console.error);
