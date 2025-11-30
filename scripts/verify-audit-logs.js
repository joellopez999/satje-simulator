
// const fetch = require('node-fetch'); // Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:3000';
// Use a service role key if possible, or simulate a logged-in user if we had a token.
// For this test, we rely on the API being accessible.
// Note: The API uses supabaseAdmin, so it should work if we hit the endpoint.
// However, the endpoint might require authentication if we added RLS or middleware checks.
// The current implementation of /api/audit-logs checks for user_id in POST but doesn't strictly enforce auth token for the API route itself (it relies on the body).
// But for GET, it uses supabaseAdmin so it bypasses RLS.

async function verifyAuditLogs() {
    console.log('Starting Audit Logs Verification...');

    // 1. Create a log entry
    console.log('1. Creating a test audit log entry...');
    const testAction = 'TEST_ACTION_' + Date.now();
    const createResponse = await fetch(`${BASE_URL}/api/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: '40e0cb14-aeb0-4e25-9824-709c18e13fa1', // Valid Auth User ID
            action: testAction,
            details: { test: true },
            ip_address: '127.0.0.1'
        })
    });

    if (!createResponse.ok) {
        console.error('Failed to create log:', await createResponse.text());
        return;
    }
    const createdLog = await createResponse.json();
    console.log('Log created:', createdLog.id);

    // 2. Fetch logs
    console.log('2. Fetching audit logs...');
    const fetchResponse = await fetch(`${BASE_URL}/api/audit-logs?action=${testAction}`);

    if (!fetchResponse.ok) {
        console.error('Failed to fetch logs:', await fetchResponse.text());
        return;
    }

    const data = await fetchResponse.json();
    const logs = data.logs;

    const found = logs.find(l => l.action === testAction);
    if (found) {
        console.log('SUCCESS: Found created log entry.');
    } else {
        console.error('FAILURE: Created log entry NOT found in list.');
        console.log('Logs received:', logs);
    }
}

// Check if native fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.log('Native fetch not found, using node-fetch...');
    // In the container, we might need to require it, or just run with a version that has it.
    // For now, we assume the environment has it or we comment this out if running in the container which has node 18.
}

verifyAuditLogs().catch(console.error);
