-- Drop the foreign key constraint on user_id to allow simulated users
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
