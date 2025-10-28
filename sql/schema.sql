-- Esquema de base de datos para SATJE
-- Crear las tablas necesarias

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'abogado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de procesos
CREATE TABLE IF NOT EXISTS processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_causa VARCHAR(50) UNIQUE NOT NULL,
    actor VARCHAR(255) NOT NULL,
    cedula_actor VARCHAR(20),
    correo_actor VARCHAR(255),
    abogado_actor VARCHAR(255),
    correo_abogado_actor VARCHAR(255),
    demandado VARCHAR(255) NOT NULL,
    cedula_demandado VARCHAR(20),
    correo_demandado VARCHAR(255),
    abogado_demandado VARCHAR(255),
    correo_abogado_demandado VARCHAR(255),
    materia VARCHAR(100) NOT NULL,
    asunto TEXT NOT NULL,
    lugar VARCHAR(100) NOT NULL,
    juez_id UUID REFERENCES users(id),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acumulado_a UUID REFERENCES processes(id),
    es_acumulado BOOLEAN DEFAULT FALSE
);

-- Tabla de expedientes
CREATE TABLE IF NOT EXISTS expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proceso_id UUID REFERENCES processes(id) ON DELETE CASCADE,
    numero_expediente INTEGER NOT NULL,
    instancia VARCHAR(20) NOT NULL DEFAULT 'primera',
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proceso_id, numero_expediente)
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    archivo_url TEXT,
    creado_por VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    despachado BOOLEAN DEFAULT FALSE,
    fecha_despacho TIMESTAMP WITH TIME ZONE,
    despachado_por VARCHAR(255),
    metadata JSONB
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_processes_numero_causa ON processes(numero_causa);
CREATE INDEX IF NOT EXISTS idx_processes_actor ON processes(actor);
CREATE INDEX IF NOT EXISTS idx_processes_demandado ON processes(demandado);
CREATE INDEX IF NOT EXISTS idx_processes_materia ON processes(materia);
CREATE INDEX IF NOT EXISTS idx_processes_estado ON processes(estado);
CREATE INDEX IF NOT EXISTS idx_actividades_expediente_id ON actividades(expediente_id);
CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON actividades(tipo);
CREATE INDEX IF NOT EXISTS idx_actividades_fecha_creacion ON actividades(fecha_creacion);

-- Insertar datos de ejemplo
INSERT INTO users (id, email, name, role) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@satje.com', 'Administrador', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440001', 'juez1@satje.com', 'Dr. Juan Pérez', 'juez'),
    ('550e8400-e29b-41d4-a716-446655440002', 'juez2@satje.com', 'Dra. María García', 'juez'),
    ('550e8400-e29b-41d4-a716-446655440003', 'secretario1@satje.com', 'Carlos López', 'secretario'),
    ('550e8400-e29b-41d4-a716-446655440004', 'abogado1@satje.com', 'Ana Martínez', 'abogado')
ON CONFLICT (id) DO NOTHING;

INSERT INTO processes (id, numero_causa, actor, cedula_actor, correo_actor, abogado_actor, correo_abogado_actor, demandado, cedula_demandado, correo_demandado, abogado_demandado, correo_abogado_demandado, materia, asunto, lugar, juez_id, estado) VALUES 
    ('660e8400-e29b-41d4-a716-446655440000', '13999-2025-00123', 'Juan Pérez', '1234567890', 'juan@email.com', 'Dr. Carlos López', 'carlos@abogado.com', 'María García', '0987654321', 'maria@email.com', 'Dra. Ana Martínez', 'ana@abogado.com', 'Civil', 'Demanda de pago de deuda', 'Quito', '550e8400-e29b-41d4-a716-446655440001', 'activo'),
    ('660e8400-e29b-41d4-a716-446655440001', '13999-2025-00124', 'Carlos López', '1122334455', 'carlos@email.com', 'Dr. Pedro Ramírez', 'pedro@abogado.com', 'Ana Martínez', '5566778899', 'ana@email.com', 'Dra. Laura Silva', 'laura@abogado.com', 'Penal', 'Robo con violencia', 'Guayaquil', '550e8400-e29b-41d4-a716-446655440002', 'activo'),
    ('660e8400-e29b-41d4-a716-446655440002', '13999-2025-00125', 'María Rodríguez', '9988776655', 'maria@email.com', 'Dr. Roberto Torres', 'roberto@abogado.com', 'Luis Fernández', '4433221100', 'luis@email.com', 'Dra. Carmen Vega', 'carmen@abogado.com', 'Laboral', 'Despido injustificado', 'Cuenca', '550e8400-e29b-41d4-a716-446655440001', 'activo')
ON CONFLICT (numero_causa) DO NOTHING;

INSERT INTO expedientes (proceso_id, numero_expediente, instancia, estado) VALUES 
    ('660e8400-e29b-41d4-a716-446655440000', 1, 'primera', 'activo'),
    ('660e8400-e29b-41d4-a716-446655440001', 1, 'primera', 'activo'),
    ('660e8400-e29b-41d4-a716-446655440002', 1, 'primera', 'activo')
ON CONFLICT (proceso_id, numero_expediente) DO NOTHING;
