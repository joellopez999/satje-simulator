-- =============================================
-- Script de inicialización para Supabase
-- Sistema SSATJE - Simulador de Tribunales
-- =============================================

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'juez', 'secretario', 'abogado', 'tercero')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de contraseñas de usuarios
CREATE TABLE IF NOT EXISTS user_passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL,
  is_temporary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de logs de actividad
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_passwords_user_id ON user_passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para la tabla users
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas de seguridad para la tabla user_passwords
CREATE POLICY "Allow all operations on user_passwords" ON user_passwords
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas de seguridad para la tabla activity_logs
CREATE POLICY "Allow all operations on activity_logs" ON activity_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Insertar usuarios de prueba
INSERT INTO users (email, name, role, is_active) VALUES
('admin@satje.ec', 'Administrador del Sistema', 'admin', true),
('juez@satje.ec', 'Dr. Juan Pérez', 'juez', true),
('secretario@satje.ec', 'Lic. María González', 'secretario', true),
('abogado@satje.ec', 'Abg. Carlos López', 'abogado', true),
('tercero@satje.ec', 'Sr. Roberto Silva', 'tercero', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar contraseñas de prueba
INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'admin123', false FROM users WHERE email = 'admin@satje.ec'
ON CONFLICT DO NOTHING;

INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'juez123', false FROM users WHERE email = 'juez@satje.ec'
ON CONFLICT DO NOTHING;

INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'secretario123', false FROM users WHERE email = 'secretario@satje.ec'
ON CONFLICT DO NOTHING;

INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'abogado123', false FROM users WHERE email = 'abogado@satje.ec'
ON CONFLICT DO NOTHING;

INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'tercero123', false FROM users WHERE email = 'tercero@satje.ec'
ON CONFLICT DO NOTHING;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Crear función para validar contraseñas
CREATE OR REPLACE FUNCTION validate_user_password(user_email VARCHAR, user_password VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
  password_record RECORD;
BEGIN
  -- Buscar usuario por email
  SELECT * INTO user_record FROM users WHERE email = user_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar contraseña del usuario
  SELECT * INTO password_record FROM user_passwords WHERE user_id = user_record.id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar contraseña
  RETURN password_record.password = user_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para obtener usuario por email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email VARCHAR)
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.name, u.role, u.is_active, u.created_at, u.updated_at
  FROM users u
  WHERE u.email = user_email AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar log inicial
INSERT INTO activity_logs (user_email, user_name, user_role, action, description, ip_address, user_agent)
VALUES ('system@satje.ec', 'Sistema', 'admin', 'database_init', 'Base de datos inicializada', '127.0.0.1', 'setup-script');

-- Mostrar resumen de la inicialización
SELECT 
  'Inicialización completada' as status,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM user_passwords) as total_passwords,
  (SELECT COUNT(*) FROM activity_logs) as total_logs;
