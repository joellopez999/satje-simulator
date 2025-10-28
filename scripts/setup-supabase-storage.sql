-- Script para configurar Supabase Storage para SATJE
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear bucket para archivos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'satje-files',
  'satje-files', 
  true,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessor']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir lectura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'satje-files');

-- 3. Política para permitir subida autenticada
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'satje-files' 
  AND auth.role() = 'authenticated'
);

-- 4. Política para permitir actualización autenticada
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'satje-files' 
  AND auth.role() = 'authenticated'
);

-- 5. Política para permitir eliminación autenticada
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'satje-files' 
  AND auth.role() = 'authenticated'
);

-- 6. Crear función para limpiar archivos huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS void AS $$
BEGIN
  -- Eliminar archivos que no tienen referencia en la tabla actividades
  DELETE FROM storage.objects 
  WHERE bucket_id = 'satje-files'
  AND name NOT IN (
    SELECT DISTINCT 
      CASE 
        WHEN archivo_url LIKE '%satje-files%' THEN 
          split_part(archivo_url, '/satje-files/', 2)
        ELSE NULL
      END
    FROM actividades 
    WHERE archivo_url IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para limpiar archivos cuando se elimina una actividad
CREATE OR REPLACE FUNCTION delete_activity_file()
RETURNS TRIGGER AS $$
DECLARE
  file_path TEXT;
BEGIN
  -- Extraer ruta del archivo de la URL
  IF OLD.archivo_url IS NOT NULL AND OLD.archivo_url LIKE '%satje-files%' THEN
    file_path := split_part(OLD.archivo_url, '/satje-files/', 2);
    
    -- Eliminar archivo del storage
    DELETE FROM storage.objects 
    WHERE bucket_id = 'satje-files' 
    AND name = file_path;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_activity_file
  AFTER DELETE ON actividades
  FOR EACH ROW
  EXECUTE FUNCTION delete_activity_file();

-- 8. Verificar configuración
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'satje-files';
