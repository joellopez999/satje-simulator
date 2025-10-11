-- Script para insertar casos de ejemplo en Supabase
-- Ejecutar en el SQL Editor de Supabase

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
    'exp-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    1,
    'primera',
    'activo'
),
(
    'exp-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    1,
    'primera',
    'activo'
),
(
    'exp-cccc-cccc-cccc-cccccccccccc',
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
    'exp-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'escrito',
    'Demanda inicial',
    'Se presenta demanda por incumplimiento de contrato de construcción. El actor alega que la empresa constructora no cumplió con las especificaciones acordadas en el contrato, causando daños materiales y morales.',
    '33333333-3333-3333-3333-333333333333',
    '{"tipo_actuacion": "demanda_inicial", "proceso_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}'
),
(
    'exp-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'providencia',
    'Auto de admisión',
    'Se admite a trámite la demanda por cobro de deuda bancaria. Se ordena notificar al demandado y se fija plazo de 15 días para contestar la demanda.',
    '11111111-1111-1111-1111-111111111111',
    '{"tipo_actuacion": "auto_admision", "proceso_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}'
),
(
    'exp-cccc-cccc-cccc-cccccccccccc',
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
    'sol-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'exp-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Solicitud de notificación',
    'Se solicita notificar al demandado sobre la admisión de la demanda y el plazo para contestar.',
    'pendiente',
    NOW(),
    '11111111-1111-1111-1111-111111111111'
),
(
    'sol-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'exp-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Solicitud de citación a audiencia',
    'Se solicita citar a las partes a la audiencia de conciliación prevista para el próximo mes.',
    'pendiente',
    NOW(),
    '11111111-1111-1111-1111-111111111111'
),
(
    'sol-cccc-cccc-cccc-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'exp-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Solicitud de informe técnico',
    'Se solicita un informe técnico sobre las condiciones de la obra en cuestión para fundamentar la demanda.',
    'pendiente',
    NOW(),
    '11111111-1111-1111-1111-111111111111'
);

-- Mensaje de confirmación
SELECT 'Casos de ejemplo insertados exitosamente' as mensaje;
