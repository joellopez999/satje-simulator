#!/bin/bash

# Script para insertar datos de ejemplo en Supabase
# Este script ejecuta el SQL de seed en Supabase

echo "🌱 Insertando datos de ejemplo en Supabase..."

# Verificar si existe el archivo SQL
if [ ! -f "scripts/seed-procesos-ejemplo.sql" ]; then
    echo "❌ Error: No se encontró el archivo scripts/seed-procesos-ejemplo.sql"
    exit 1
fi

echo "📋 Ejecutando script SQL..."
echo ""
echo "Para ejecutar este script:"
echo "1. Ve al Dashboard de Supabase"
echo "2. Navega a SQL Editor"
echo "3. Copia y pega el contenido de scripts/seed-procesos-ejemplo.sql"
echo "4. Ejecuta el script"
echo ""
echo "O ejecuta manualmente:"
echo "supabase db reset --linked"
echo ""

# Mostrar el contenido del archivo SQL
echo "📄 Contenido del script SQL:"
echo "=================================="
cat scripts/seed-procesos-ejemplo.sql
echo "=================================="
echo ""
echo "✅ Script preparado. Ejecuta el SQL en Supabase Dashboard."
