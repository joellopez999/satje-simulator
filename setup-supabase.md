# 🔧 Configuración de Supabase para SSATJE

## 📋 Pasos para configurar Supabase

### 1. Crear proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa la información del proyecto:
   - **Name**: `satje-simulator`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Selecciona la más cercana a Ecuador

### 2. Obtener credenciales
1. En el dashboard de tu proyecto, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio-aqui

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Crear esquema de base de datos
Ejecuta el siguiente SQL en el editor SQL de Supabase:

```sql
-- Crear tabla de usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'juez', 'secretario', 'abogado', 'tercero')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de contraseñas
CREATE TABLE user_passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  password VARCHAR(255) NOT NULL,
  is_temporary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_passwords_user_id ON user_passwords(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (básicas)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can delete users" ON users FOR DELETE USING (true);

CREATE POLICY "Users can view passwords" ON user_passwords FOR SELECT USING (true);
CREATE POLICY "Users can insert passwords" ON user_passwords FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update passwords" ON user_passwords FOR UPDATE USING (true);
CREATE POLICY "Users can delete passwords" ON user_passwords FOR DELETE USING (true);
```

### 5. Insertar usuarios de prueba
```sql
-- Insertar usuarios de prueba
INSERT INTO users (email, name, role, is_active) VALUES
('admin@satje.ec', 'Administrador del Sistema', 'admin', true),
('juez@satje.ec', 'Dr. Juan Pérez', 'juez', true),
('secretario@satje.ec', 'Lic. María González', 'secretario', true),
('abogado@satje.ec', 'Abg. Carlos López', 'abogado', true);

-- Insertar contraseñas de prueba
INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'admin123', false FROM users WHERE email = 'admin@satje.ec';

INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'juez123', false FROM users WHERE email = 'juez@satje.ec';

INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'secretario123', false FROM users WHERE email = 'secretario@satje.ec';

INSERT INTO user_passwords (user_id, password, is_temporary) 
SELECT id, 'abogado123', false FROM users WHERE email = 'abogado@satje.ec';
```

### 6. Verificar configuración
Una vez configurado, ejecuta:
```bash
node test-supabase.js
```

## 🔍 Verificación de funcionamiento

El script de prueba verificará:
- ✅ Conexión con Supabase
- ✅ Existencia de tablas
- ✅ Acceso a datos de usuarios
- ✅ Funciones de autenticación

## 🚨 Solución de problemas

### Error: "Invalid API key"
- Verifica que la clave anónima sea correcta
- Asegúrate de que el proyecto esté activo

### Error: "relation does not exist"
- Ejecuta el script SQL de creación de tablas
- Verifica que las tablas se crearon correctamente

### Error: "fetch failed"
- Verifica la URL del proyecto
- Asegúrate de que el proyecto esté en la región correcta
