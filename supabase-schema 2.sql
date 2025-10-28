-- Esquema de base de datos para SATJE Simulator
-- Este archivo contiene todas las tablas necesarias para el sistema

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios del sistema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('juez', 'secretario', 'abogado', 'tercero', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de procesos judiciales
CREATE TABLE procesos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_causa VARCHAR(50) UNIQUE NOT NULL,
    actor TEXT NOT NULL,
    cedula_actor VARCHAR(20),
    correo_actor VARCHAR(255),
    abogado_actor TEXT,
    correo_abogado_actor VARCHAR(255),
    demandado TEXT NOT NULL,
    cedula_demandado VARCHAR(20),
    correo_demandado VARCHAR(255),
    abogado_demandado TEXT,
    correo_abogado_demandado VARCHAR(255),
    materia VARCHAR(100) NOT NULL,
    asunto TEXT NOT NULL,
    lugar VARCHAR(255) NOT NULL,
    juez_id UUID REFERENCES users(id),
    estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'acumulado', 'archivado', 'concluido')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acumulado_a UUID REFERENCES procesos(id),
    es_acumulado BOOLEAN DEFAULT false
);

-- Tabla de expedientes (subcategorías por instancia)
CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proceso_id UUID REFERENCES procesos(id) ON DELETE CASCADE,
    numero_expediente INTEGER NOT NULL,
    instancia VARCHAR(50) NOT NULL CHECK (instancia IN ('primera', 'segunda', 'tercera')),
    estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'archivado', 'concluido')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proceso_id, numero_expediente)
);

-- Tabla de actividades (providencias, razones, escritos, otros)
CREATE TABLE actividades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('providencia', 'razon', 'escrito', 'otros')),
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT,
    archivo_url TEXT,
    creado_por UUID REFERENCES users(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Tabla de archivos adjuntos
CREATE TABLE archivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    tipo_mime VARCHAR(100),
    tamaño_bytes BIGINT,
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles y permisos
CREATE TABLE roles_permisos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL,
    permiso VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

-- Insertar permisos básicos
INSERT INTO roles_permisos (role, permiso, descripcion) VALUES
('juez', 'crear_proceso', 'Crear nuevos procesos judiciales'),
('juez', 'crear_expediente', 'Crear expedientes en procesos'),
('juez', 'crear_providencia', 'Crear providencias'),
('juez', 'acumular_procesos', 'Acumular procesos'),
('juez', 'ver_todos_procesos', 'Ver todos los procesos del sistema'),
('secretario', 'crear_razon', 'Crear razones de secretaría'),
('secretario', 'crear_oficio', 'Crear oficios'),
('secretario', 'asignar_procurador', 'Asignar procurador judicial'),
('abogado', 'crear_proceso', 'Crear nuevos procesos judiciales'),
('abogado', 'crear_escrito', 'Crear escritos en procesos'),
('abogado', 'ver_mis_procesos', 'Ver procesos donde participa'),
('tercero', 'crear_escrito', 'Crear escritos como tercero'),
('admin', 'gestionar_usuarios', 'Gestionar usuarios del sistema'),
('admin', 'ver_todos_procesos', 'Ver todos los procesos del sistema');

-- Función para generar número de causa automáticamente
CREATE OR REPLACE FUNCTION generar_numero_causa()
RETURNS TEXT AS $$
DECLARE
    año_actual INTEGER;
    secuencial INTEGER;
    numero_causa TEXT;
BEGIN
    -- Obtener año actual
    año_actual := EXTRACT(YEAR FROM NOW());
    
    -- Obtener siguiente número secuencial para el año
    SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_causa, '-', 3) AS INTEGER)), 0) + 1
    INTO secuencial
    FROM procesos
    WHERE SPLIT_PART(numero_causa, '-', 2) = año_actual::TEXT;
    
    -- Formato: 13999-YYYY-NNNNN
    numero_causa := '13999-' || año_actual || '-' || LPAD(secuencial::TEXT, 5, '0');
    
    RETURN numero_causa;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de causa automáticamente
CREATE OR REPLACE FUNCTION trigger_generar_numero_causa()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_causa IS NULL OR NEW.numero_causa = '' THEN
        NEW.numero_causa := generar_numero_causa();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_numero_causa
    BEFORE INSERT ON procesos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generar_numero_causa();

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION trigger_actualizar_fecha()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_fecha_procesos
    BEFORE UPDATE ON procesos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_actualizar_fecha();

-- Índices para optimizar consultas
CREATE INDEX idx_procesos_numero_causa ON procesos(numero_causa);
CREATE INDEX idx_procesos_estado ON procesos(estado);
CREATE INDEX idx_procesos_juez ON procesos(juez_id);
CREATE INDEX idx_procesos_fecha_creacion ON procesos(fecha_creacion);
CREATE INDEX idx_expedientes_proceso ON expedientes(proceso_id);
CREATE INDEX idx_actividades_expediente ON actividades(expediente_id);
CREATE INDEX idx_actividades_tipo ON actividades(tipo);
CREATE INDEX idx_actividades_fecha ON actividades(fecha_creacion);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- Políticas de seguridad (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE procesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: pueden ver su propia información
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Política para procesos: diferentes niveles de acceso según rol
CREATE POLICY "Jueces can view all procesos" ON procesos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'juez'
        )
    );

CREATE POLICY "Secretarios can view all procesos" ON procesos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'secretario'
        )
    );

CREATE POLICY "Abogados can view assigned procesos" ON procesos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'abogado'
        )
    );

-- Política para expedientes
CREATE POLICY "Users can view expedientes of accessible procesos" ON expedientes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM procesos 
            WHERE procesos.id = expedientes.proceso_id
        )
    );

-- Política para actividades
CREATE POLICY "Users can view actividades of accessible expedientes" ON actividades
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM expedientes 
            JOIN procesos ON procesos.id = expedientes.proceso_id
            WHERE expedientes.id = actividades.expediente_id
        )
    );
