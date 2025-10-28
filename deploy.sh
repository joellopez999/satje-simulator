#!/bin/bash

# Script de Despliegue - SATJE Simulator Producción
echo "🚀 Iniciando despliegue de SATJE Simulator..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar variables de entorno
if [ ! -f ".env.production" ]; then
    echo "⚠️  Advertencia: No se encontró .env.production"
    echo "📝 Copiando archivo de ejemplo..."
    cp env.production.example .env.production
    echo "🔧 Por favor, configura las variables de entorno en .env.production"
fi

# Construir para producción
echo "🔨 Construyendo para producción..."
npm run prod:build

if [ $? -eq 0 ]; then
    echo "✅ Construcción exitosa!"
    echo ""
    echo "🎯 Opciones de despliegue:"
    echo "1. Local: npm run prod:start"
    echo "2. Vercel: vercel --prod"
    echo "3. Netlify: Subir carpeta 'out'"
    echo "4. Servidor: npm run start"
    echo ""
    echo "🌐 URLs:"
    echo "- Desarrollo: http://localhost:3000"
    echo "- Producción: http://localhost:3001"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Configurar variables de entorno"
    echo "2. Configurar base de datos Supabase"
    echo "3. Configurar dominio personalizado"
    echo "4. Configurar HTTPS"
else
    echo "❌ Error en la construcción"
    exit 1
fi
