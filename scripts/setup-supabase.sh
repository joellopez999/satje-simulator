#!/bin/bash

# Script para configurar Supabase para SATJE Simulator
# Este script ayuda a configurar el proyecto con Supabase

echo "🚀 Configurando Supabase para SATJE Simulator..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    echo "   Visita: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar si Docker está ejecutándose
if ! docker info &> /dev/null; then
    echo "❌ Docker no está ejecutándose. Por favor inicia Docker."
    exit 1
fi

echo "✅ Docker está instalado y ejecutándose"

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "✅ Archivo .env.local ya existe"
fi

echo ""
echo "📋 Pasos para configurar Supabase:"
echo ""
echo "1. 🌐 Ve a https://supabase.com/dashboard"
echo "2. 🔑 Crea un nuevo proyecto"
echo "3. 📋 Copia las credenciales de tu proyecto:"
echo "   - Project URL"
echo "   - Anon Key"
echo "   - Service Role Key"
echo "4. ✏️  Edita el archivo .env.local con tus credenciales"
echo "5. 🗄️  Ejecuta el schema SQL en tu proyecto de Supabase:"
echo "   - Ve a SQL Editor en tu dashboard"
echo "   - Copia y pega el contenido de supabase-schema.sql"
echo "   - Ejecuta el script"
echo "6. 🌱 Opcionalmente, ejecuta el seed.sql para datos de ejemplo"
echo ""
echo "🔧 Comandos útiles:"
echo "   npm run dev          # Iniciar servidor de desarrollo"
echo "   npm run build        # Construir para producción"
echo ""
echo "📚 Documentación:"
echo "   - Supabase: https://supabase.com/docs"
echo "   - Next.js: https://nextjs.org/docs"
echo ""
echo "✅ Configuración completada. ¡Sigue los pasos arriba para finalizar!"
