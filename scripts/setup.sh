#!/bin/bash

# Script de configuración para SATJE Simulator
echo "🚀 Configurando SATJE Simulator..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo de configuración..."
    cp env.example .env.local
    echo "✅ Archivo .env.local creado. Por favor configura tus credenciales de Supabase."
else
    echo "✅ Archivo .env.local ya existe."
fi

# Verificar que las dependencias se instalaron correctamente
if [ ! -d "node_modules" ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tus credenciales de Supabase en .env.local"
echo "2. Ejecuta el esquema de base de datos en Supabase (supabase-schema.sql)"
echo "3. Ejecuta 'npm run dev' para iniciar el servidor de desarrollo"
echo ""
echo "📚 Para más información, consulta el README.md"
