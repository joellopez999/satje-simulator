#!/bin/bash

# Script para configurar Supabase completo con esquema y datos de ejemplo
# Este script ejecuta el SQL completo en Supabase

echo "🚀 Configurando Supabase completo con esquema y datos de ejemplo..."

# Verificar si existe el archivo SQL
if [ ! -f "scripts/setup-completo.sql" ]; then
    echo "❌ Error: No se encontró el archivo scripts/setup-completo.sql"
    exit 1
fi

echo "📋 Ejecutando script SQL completo..."
echo ""
echo "Para ejecutar este script:"
echo "1. Ve al Dashboard de Supabase"
echo "2. Navega a SQL Editor"
echo "3. Copia y pega el contenido de scripts/setup-completo.sql"
echo "4. Ejecuta el script"
echo ""
echo "Este script incluye:"
echo "✅ Creación de todas las tablas"
echo "✅ Inserción de usuarios de ejemplo"
echo "✅ Inserción de 3 procesos de ejemplo"
echo "✅ Inserción de expedientes y actividades"
echo "✅ Inserción de solicitudes de secretaría"
echo ""

# Mostrar el contenido del archivo SQL
echo "📄 Contenido del script SQL completo:"
echo "=================================="
cat scripts/setup-completo.sql
echo "=================================="
echo ""
echo "✅ Script completo preparado. Ejecuta el SQL en Supabase Dashboard."
