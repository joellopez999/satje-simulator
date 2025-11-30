
const fetch = require('node-fetch'); // Or native fetch if Node 18+

async function verifyAuditLog() {
    const API_URL = 'http://localhost:3000/api/audit-logs';
    // Replace with a valid user ID from your database
    const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

    console.log('Testing Audit Log Creation...');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: USER_ID,
                action: 'TEST_ACTION_SCRIPT',
                details: { source: 'verification_script', time: new Date().toISOString() },
                ip_address: '127.0.0.1'
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Failed to create log:', response.status, text);
            return;
        }

        const data = await response.json();
        console.log('Log created successfully:', data);

        console.log('Testing Audit Log Retrieval...');
        const getResponse = await fetch(`${API_URL}?user_id=${USER_ID}&limit=5`);

        if (!getResponse.ok) {
            const text = await getResponse.text();
            console.error('Failed to fetch logs:', getResponse.status, text);
            return;
        }

        const logs = await getResponse.json();
        console.log('Logs retrieved:', logs);

        const found = logs.logs.some(log => log.action === 'TEST_ACTION_SCRIPT');
        if (found) {
            console.log('SUCCESS: Test log found in retrieval.');
        } else {
            console.error('FAILURE: Test log NOT found in retrieval.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyAuditLog();
