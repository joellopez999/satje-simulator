
-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  color TEXT DEFAULT 'blue',
  icon TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_config table (singleton)
CREATE TABLE IF NOT EXISTS system_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  general JSONB DEFAULT '{}'::jsonb,
  database JSONB DEFAULT '{}'::jsonb,
  notifications JSONB DEFAULT '{}'::jsonb,
  security JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 'default')
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create policies for roles
CREATE POLICY "Allow read access to all authenticated users" ON roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to admins" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create policies for system_config
CREATE POLICY "Allow read access to all authenticated users" ON system_config
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to admins" ON system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert default roles if table is empty
INSERT INTO roles (id, name, description, permissions, color, icon)
SELECT 'admin', 'Administrador', 'Acceso completo al sistema', 
  '["read_processes", "write_processes", "delete_processes", "manage_users", "manage_roles", "create_providencias", "create_escritos", "manage_secretaria", "view_reports", "system_admin"]'::jsonb, 
  'red', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'admin');

INSERT INTO roles (id, name, description, permissions, color, icon)
SELECT 'juez', 'Juez', 'Gestión de procesos judiciales', 
  '["read_processes", "write_processes", "create_providencias", "view_reports"]'::jsonb, 
  'blue', 'juez'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'juez');

INSERT INTO roles (id, name, description, permissions, color, icon)
SELECT 'secretario', 'Secretario', 'Actuaciones de secretaría', 
  '["read_processes", "write_processes", "manage_secretaria", "view_reports"]'::jsonb, 
  'green', 'secretario'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'secretario');

INSERT INTO roles (id, name, description, permissions, color, icon)
SELECT 'abogado', 'Abogado', 'Acceso a procesos y escritos', 
  '["read_processes", "create_escritos"]'::jsonb, 
  'purple', 'abogado'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'abogado');

-- Insert default config if table is empty
INSERT INTO system_config (id, general, database, notifications, security)
VALUES (
  'default',
  '{"siteName": "SATJE Simulator", "siteDescription": "Sistema Automático de Trámite Judicial Ecuatoriano", "timezone": "America/Guayaquil", "language": "es"}'::jsonb,
  '{"backupEnabled": true, "backupFrequency": "daily", "retentionDays": 30}'::jsonb,
  '{"emailEnabled": false, "smtpHost": "", "smtpPort": 587, "smtpUser": "", "telegramEnabled": false, "telegramBotToken": ""}'::jsonb,
  '{"sessionTimeout": 30, "passwordPolicy": "medium", "twoFactorEnabled": false}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
