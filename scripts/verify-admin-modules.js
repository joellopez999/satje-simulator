
// const fetch = require('node-fetch'); // Or native fetch in Node 18+

const BASE_URL = 'http://localhost:3000/api';

async function verifyAdminModules() {
    console.log('Starting Admin Modules Verification...');

    // 1. Verify Roles API
    console.log('\n--- Verifying Roles API ---');

    // Create Role
    const newRole = {
        id: `test-role-${Date.now()}`,
        name: 'Test Role',
        description: 'Role created by verification script',
        permissions: ['read_test'],
        color: 'gray',
        icon: 'test'
    };

    try {
        console.log('Creating role...');
        const createRes = await fetch(`${BASE_URL}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRole)
        });

        if (!createRes.ok) {
            const err = await createRes.text();
            console.error('Failed to create role:', createRes.status, err);
            // If 500 or 400, it might be because table doesn't exist
            if (err.includes('relation "roles" does not exist')) {
                console.error('CRITICAL: Table "roles" does not exist. Please run the migration SQL.');
                return;
            }
        } else {
            const createdRole = await createRes.json();
            console.log('Role created:', createdRole.id);

            // Fetch Roles
            console.log('Fetching roles...');
            const fetchRes = await fetch(`${BASE_URL}/roles`);
            const roles = await fetchRes.json();
            const found = roles.find(r => r.id === createdRole.id);

            if (found) {
                console.log('SUCCESS: Created role found in list.');
            } else {
                console.error('FAILURE: Created role NOT found in list.');
            }

            // Delete Role
            console.log('Deleting role...');
            const deleteRes = await fetch(`${BASE_URL}/roles?id=${createdRole.id}`, {
                method: 'DELETE'
            });

            if (deleteRes.ok) {
                console.log('SUCCESS: Role deleted.');
            } else {
                console.error('FAILURE: Could not delete role.');
            }
        }

    } catch (e) {
        console.error('Error verifying roles:', e);
    }

    // 2. Verify Config API
    console.log('\n--- Verifying Config API ---');
    try {
        console.log('Fetching config...');
        const configRes = await fetch(`${BASE_URL}/config`);
        if (configRes.ok) {
            const config = await configRes.json();
            console.log('Config fetched successfully.');

            // Update Config
            console.log('Updating config...');
            const newConfig = {
                ...config,
                general: { ...config.general, siteName: `SATJE Test ${Date.now()}` }
            };

            const updateRes = await fetch(`${BASE_URL}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });

            if (updateRes.ok) {
                const updatedConfig = await updateRes.json();
                if (updatedConfig.general.siteName === newConfig.general.siteName) {
                    console.log('SUCCESS: Config updated and verified.');
                } else {
                    console.error('FAILURE: Config update mismatch.');
                }
            } else {
                const err = await updateRes.text();
                console.error('Failed to update config:', updateRes.status, err);
                if (err.includes('relation "system_config" does not exist')) {
                    console.error('CRITICAL: Table "system_config" does not exist. Please run the migration SQL.');
                }
            }

        } else {
            console.error('Failed to fetch config:', configRes.status);
        }
    } catch (e) {
        console.error('Error verifying config:', e);
    }
}

// Run verification
verifyAdminModules();
