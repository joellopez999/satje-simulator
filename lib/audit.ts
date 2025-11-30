
/**
 * Utility function to log audit actions to the database via API.
 * 
 * @param action The action name (e.g., 'SUBMIT_WRITING', 'LOGIN')
 * @param details Additional details about the action (JSON object)
 * @param userId Optional user ID. If not provided, the API will try to use the authenticated user (though client-side calls usually pass it if available contextually, or the API handles it if using auth headers - but our API expects it in body for now as per previous implementation)
 */
export const logAuditAction = async (action: string, details: any, userId?: string) => {
    try {
        // If userId is not provided, we might want to get it from a context or let the API handle it.
        // However, our current API implementation expects user_id in the body.
        // For client-side calls where we might not have the ID handy in every component without hooks, 
        // we should try to ensure it's passed or retrieved.
        // For now, we'll assume the caller passes it or we send a placeholder if strictly necessary, 
        // but ideally the API should extract it from the session if not provided.
        // Given the current API implementation in /api/audit-logs/route.ts:
        // const { user_id, action, details, ip_address } = body
        // It requires user_id.

        if (!userId) {
            console.warn('logAuditAction called without userId. Audit log might fail if API requires it.');
        }

        const response = await fetch('/api/audit-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                action,
                details,
                ip_address: 'client', // The API or DB could also extract this from headers
            }),
        });

        if (!response.ok) {
            console.error('Failed to log audit action:', await response.text());
        }
    } catch (error) {
        console.error('Error logging audit action:', error);
    }
};
