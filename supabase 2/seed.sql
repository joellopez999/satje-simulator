-- Datos iniciales para SATJE Simulator
-- Este archivo contiene usuarios y datos de ejemplo para desarrollo

-- Insertar usuarios de ejemplo
INSERT INTO users (id, email, name, role, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@satje.com', 'Administrador del Sistema', 'admin', true),
('550e8400-e29b-41d4-a716-446655440002', 'juez1@satje.com', 'Dr. Carlos López', 'juez', true),
('550e8400-e29b-41d4-a716-446655440003', 'juez2@satje.com', 'Dra. María González', 'juez', true),
('550e8400-e29b-41d4-a716-446655440004', 'secretario1@satje.com', 'Lic. Ana Martínez', 'secretario', true),
('550e8400-e29b-41d4-a716-446655440005', 'abogado1@satje.com', 'Dr. Roberto Silva', 'abogado', true),
('550e8400-e29b-41d4-a716-446655440006', 'abogado2@satje.com', 'Dra. Carmen Vega', 'abogado', true),
('550e8400-e29b-41d4-a716-446655440007', 'tercero1@satje.com', 'Perito Juan Pérez', 'tercero', true);

-- Insertar procesos de ejemplo
INSERT INTO procesos (
    id, numero_causa, actor, cedula_actor, correo_actor, abogado_actor, correo_abogado_actor,
    demandado, cedula_demandado, correo_demandado, abogado_demandado, correo_abogado_demandado,
    materia, asunto, lugar, juez_id, estado
) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '13999-2025-00123',
    'Juan Pérez',
    '1234567890',
    'juan.perez@email.com',
    'Dr. Carlos López',
    'carlos.lopez@abogado.com',
    'María González',
    '0987654321',
    'maria.gonzalez@email.com',
    'Dra. Ana Martínez',
    'ana.martinez@abogado.com',
    'Civil',
    'Demanda de pago de salarios',
    'Portoviejo, Manabí',
    '550e8400-e29b-41d4-a716-446655440002',
    'activo'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '13999-2025-00124',
    'Carlos López',
    '1122334455',
    'carlos.lopez@email.com',
    'Dr. Roberto Silva',
    'roberto.silva@abogado.com',
    'Ana Martínez',
    '5566778899',
    'ana.martinez@email.com',
    'Dra. Carmen Vega',
    'carmen.vega@abogado.com',
    'Penal',
    'Robo',
    'Manta, Manabí',
    '550e8400-e29b-41d4-a716-446655440003',
    'activo'
);

-- Insertar expedientes de ejemplo
INSERT INTO expedientes (id, proceso_id, numero_expediente, instancia, estado) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 1, 'primera', 'activo'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 1, 'primera', 'activo');

-- Insertar actividades de ejemplo
INSERT INTO actividades (id, expediente_id, tipo, titulo, contenido, creado_por) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'escrito', 'Demanda inicial', 'Se presenta demanda de pago de salarios contra la demandada...', '550e8400-e29b-41d4-a716-446655440005'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'providencia', 'Auto de admisión', 'Se admite a trámite la demanda presentada...', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'escrito', 'Denuncia por robo', 'Se presenta denuncia por el delito de robo...', '550e8400-e29b-41d4-a716-446655440005');
