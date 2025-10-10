// Función para generar datos de prueba para el sistema de solicitudes a secretaría
export const generateTestSolicitudes = () => {
  // Obtener solicitudes existentes para no eliminar datos
  const existingSolicitudes = JSON.parse(localStorage.getItem('satje_solicitudes_secretaria') || '[]')
  
  const solicitudesPrueba = [
    {
      id: 'test-1-123456789',
      providencia_id: 'prov-1-123456789',
      proceso_id: 'proc-1',
      expediente_id: 'exp-1',
      numero_causa: '13999-2024-00001',
      instrucciones: 'Se solicita a la secretaría que notifique a las partes sobre la admisión de la demanda y fije el término de prueba por 15 días.',
      estado: 'pendiente',
      fecha_solicitud: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
      solicitado_por: 'Dr. Juan Pérez',
      solicitado_por_id: 'juez-1',
      titulo_providencia: 'Auto de admisión de demanda'
    },
    {
      id: 'test-2-123456789',
      providencia_id: 'prov-2-123456789',
      proceso_id: 'proc-2',
      expediente_id: 'exp-2',
      numero_causa: '13999-2024-00002',
      instrucciones: 'Se requiere que la secretaría cite a las partes a audiencia de conciliación para el próximo martes a las 10:00 AM.',
      estado: 'pendiente',
      fecha_solicitud: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
      solicitado_por: 'Dra. María González',
      solicitado_por_id: 'juez-2',
      titulo_providencia: 'Auto de citación a audiencia'
    },
    {
      id: 'test-3-123456789',
      providencia_id: 'prov-3-123456789',
      proceso_id: 'proc-3',
      expediente_id: 'exp-3',
      numero_causa: '13999-2024-00003',
      instrucciones: 'Se solicita que la secretaría realice las notificaciones correspondientes y prepare el expediente para la audiencia de juzgamiento.',
      estado: 'completada',
      fecha_solicitud: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días atrás
      fecha_completada: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
      solicitado_por: 'Dr. Carlos Rodríguez',
      solicitado_por_id: 'juez-3',
      titulo_providencia: 'Auto de preparación de audiencia',
      completada_por: 'Lic. Ana Martínez'
    }
  ]

  // Combinar con solicitudes existentes (evitar duplicados)
  const combinedSolicitudes = [...existingSolicitudes, ...solicitudesPrueba]
  
  // Guardar en localStorage
  localStorage.setItem('satje_solicitudes_secretaria', JSON.stringify(combinedSolicitudes))
  
  return combinedSolicitudes
}

// Función para limpiar datos de prueba
export const clearTestSolicitudes = () => {
  localStorage.removeItem('satje_solicitudes_secretaria')
}
