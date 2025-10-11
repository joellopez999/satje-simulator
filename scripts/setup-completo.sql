-- Script completo para configurar Supabase con esquema y datos de ejemplo
-- Ejecutar en el SQL Editor de Supabase

-- ==========================================
-- 1. EJECUTAR PRIMERO EL ESQUEMA COMPLETO
-- ==========================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('juez', 'secretario', 'abogado', 'tercero', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de procesos judiciales
CREATE TABLE IF NOT EXISTS procesos (
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
CREATE TABLE IF NOT EXISTS expedientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proceso_id UUID REFERENCES procesos(id) ON DELETE CASCADE,
    numero_expediente INTEGER NOT NULL,
    instancia VARCHAR(50) NOT NULL CHECK (instancia IN ('primera', 'segunda', 'tercera')),
    estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'archivado', 'concluido')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE IF NOT EXISTS actividades (
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
CREATE TABLE IF NOT EXISTS archivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actividad_id UUID REFERENCES actividades(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    tipo_mime VARCHAR(100),
    tamaño_bytes BIGINT,
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de secretaría
CREATE TABLE IF NOT EXISTS solicitudes_secretaria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proceso_id UUID REFERENCES procesos(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    juez_id UUID REFERENCES users(id),
    titulo VARCHAR(255) NOT NULL,
    instrucciones TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completada TIMESTAMP WITH TIME ZONE,
    completada_por UUID REFERENCES users(id),
    solicitado_por UUID REFERENCES users(id),
    actividad_creada_id UUID REFERENCES actividades(id),
    metadata JSONB
);

-- ==========================================
-- 2. INSERTAR DATOS DE EJEMPLO
-- ==========================================

-- Insertar usuarios de ejemplo si no existen
INSERT INTO users (id, email, name, role, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'juez1@satje.ec', 'Dr. Carlos Mendoza', 'juez', true),
('22222222-2222-2222-2222-222222222222', 'secretario1@satje.ec', 'Lic. María González', 'secretario', true),
('33333333-3333-3333-3333-333333333333', 'abogado1@satje.ec', 'Dr. Juan Pérez', 'abogado', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar procesos de ejemplo
INSERT INTO procesos (
    id,
    numero_causa,
    actor,
    cedula_actor,
    correo_actor,
    abogado_actor,
    correo_abogado_actor,
    demandado,
    cedula_demandado,
    correo_demandado,
    abogado_demandado,
    correo_abogado_demandado,
    materia,
    asunto,
    lugar,
    juez_id,
    estado
) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2024-001-001',
    'María Elena Rodríguez',
    '1234567890',
    'maria.rodriguez@email.com',
    'Dr. Juan Pérez',
    'juan.perez@bufete.com',
    'Empresa Constructora ABC S.A.',
    '0987654321001',
    'contacto@constructora-abc.com',
    'Dr. Carlos López',
    'carlos.lopez@estudio.com',
    'Civil',
    'Demanda por incumplimiento de contrato de construcción',
    'Guayaquil',
    '11111111-1111-1111-1111-111111111111',
    'activo'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2024-002-001',
    'Roberto Carlos Silva',
    '0987654321',
    'roberto.silva@email.com',
    'Dra. Ana Martínez',
    'ana.martinez@legal.com',
    'Banco Nacional del Ecuador',
    '0991234567001',
    'legal@bancanacional.com',
    'Dr. Luis Fernández',
    'luis.fernandez@bancanacional.com',
    'Mercantil',
    'Demanda por cobro de deuda bancaria',
    'Quito',
    '11111111-1111-1111-1111-111111111111',
    'activo'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2024-003-001',
    'Patricia Lucía Morales',
    '1122334455',
    'patricia.morales@email.com',
    'Dr. Miguel Torres',
    'miguel.torres@abogados.com',
    'Municipio de Guayaquil',
    '0960000000001',
    'legal@guayaquil.gob.ec',
    'Dr. Fernando Herrera',
    'fernando.herrera@guayaquil.gob.ec',
    'Administrativo',
    'Demanda por responsabilidad extracontractual del Estado',
    'Guayaquil',
    '11111111-1111-1111-1111-111111111111',
    'activo'
);

-- Insertar expedientes de ejemplo
INSERT INTO expedientes (
    id,
    proceso_id,
    numero_expediente,
    instancia,
    estado
) VALUES
(
    'aaaaaaaa-bbbb-cccc-dddd-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    1,
    'primera',
    'activo'
),
(
    'bbbbbbbb-cccc-dddd-eeee-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    1,
    'primera',
    'activo'
),
(
    'cccccccc-dddd-eeee-ffff-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    1,
    'primera',
    'activo'
);

-- Insertar algunas actividades de ejemplo
INSERT INTO actividades (
    expediente_id,
    tipo,
    titulo,
    contenido,
    creado_por,
    metadata
) VALUES
(
    'aaaaaaaa-bbbb-cccc-dddd-aaaaaaaaaaaa',
    'escrito',
    'Demanda inicial',
    'Se presenta demanda por incumplimiento de contrato de construcción. El actor alega que la empresa constructora no cumplió con las especificaciones acordadas en el contrato, causando daños materiales y morales.',
    '33333333-3333-3333-3333-333333333333',
    '{"tipo_actuacion": "demanda_inicial", "proceso_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}'
),
(
    'bbbbbbbb-cccc-dddd-eeee-bbbbbbbbbbbb',
    'providencia',
    'Auto de admisión',
    'Se admite a trámite la demanda por cobro de deuda bancaria. Se ordena notificar al demandado y se fija plazo de 15 días para contestar la demanda.',
    '11111111-1111-1111-1111-111111111111',
    '{"tipo_actuacion": "auto_admision", "proceso_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}'
),
(
    'cccccccc-dddd-eeee-ffff-cccccccccccc',
    'razon',
    'Actuación de secretaría',
    'Se recibe la demanda y se procede a su revisión. Se verifica que cumple con todos los requisitos legales. Se ordena su admisión a trámite.',
    '22222222-2222-2222-2222-222222222222',
    '{"tipo_actuacion": "revision_demanda", "proceso_id": "cccccccc-cccc-cccc-cccc-cccccccccccc"}'
);

-- Insertar solicitudes de secretaría de ejemplo
INSERT INTO solicitudes_secretaria (
    id,
    proceso_id,
    expediente_id,
    juez_id,
    titulo,
    instrucciones,
    estado,
    fecha_solicitud,
    solicitado_por
) VALUES
(
    'aaaaaaaa-eeee-ffff-gggg-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-bbbb-cccc-dddd-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Solicitud de notificación',
    'Se solicita notificar al demandado sobre la admisión de la demanda y el plazo para contestar.',
    'pendiente',
    NOW(),
    '11111111-1111-1111-1111-111111111111'
),
(
    'bbbbbbbb-ffff-gggg-hhhh-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-cccc-dddd-eeee-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Solicitud de citación a audiencia',
    'Se solicita citar a las partes a la audiencia de conciliación prevista para el próximo mes.',
    'pendiente',
    NOW(),
    '11111111-1111-1111-1111-111111111111'
),
(
    'cccccccc-gggg-hhhh-iiii-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'cccccccc-dddd-eeee-ffff-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Solicitud de informe técnico',
    'Se solicita un informe técnico sobre las condiciones de la obra en cuestión para fundamentar la demanda.',
    'pendiente',
    NOW(),
    '11111111-1111-1111-1111-111111111111'
);

-- Mensaje de confirmación
SELECT 'Esquema y datos de ejemplo configurados exitosamente' as mensaje;
