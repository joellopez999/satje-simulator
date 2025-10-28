# 🚀 Instrucciones de Despliegue - SATJE Simulator

## 📁 Estructura de Proyectos

```
/Users/joellopez/Documents/
├── SSATJE/                    # 🛠️ DESARROLLO
│   ├── Puerto: 3000
│   ├── Estado: Funcionando
│   └── Uso: Desarrollo y pruebas
│
└── SSATJE-PRODUCTION/         # 🌐 PRODUCCIÓN
    ├── Puerto: 3001
    ├── Estado: Listo para despliegue
    └── Uso: Producción y lanzamiento
```

## 🛠️ Desarrollo (SSATJE)

### Iniciar Servidor de Desarrollo
```bash
cd /Users/joellopez/Documents/SSATJE
npm run dev
# Acceso: http://localhost:3000
```

### Características
- ✅ Puerto 3000
- ✅ Modo desarrollo
- ✅ Hot reload
- ✅ Debugging completo
- ✅ Base de datos local (localStorage)

## 🌐 Producción (SSATJE-PRODUCTION)

### 1. Configuración Inicial
```bash
cd /Users/joellopez/Documents/SSATJE-PRODUCTION

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.production.example .env.production
# Editar .env.production con tus valores
```

### 2. Desarrollo Local de Producción
```bash
# Iniciar en puerto 3001
npm run dev
# Acceso: http://localhost:3001
```

### 3. Construcción para Producción
```bash
# Construir para producción
npm run prod:build

# Iniciar servidor de producción
npm run prod:start
```

### 4. Script de Despliegue Automático
```bash
# Ejecutar script de despliegue
./deploy.sh
```

## 🚀 Opciones de Despliegue

### Opción 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde el directorio de producción
cd /Users/joellopez/Documents/SSATJE-PRODUCTION
vercel --prod
```

### Opción 2: Netlify
```bash
# Construir proyecto
npm run prod:build

# Subir carpeta 'out' a Netlify
# O conectar repositorio Git
```

### Opción 3: Servidor Propio
```bash
# Construir
npm run prod:build

# Iniciar servidor
npm run start
```

## 🔧 Configuración de Base de Datos

### 1. Crear Proyecto Supabase
1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Obtener URL y API Key

### 2. Configurar Variables
```bash
# En .env.production
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
```

### 3. Ejecutar Migraciones
```bash
# Ejecutar esquema de base de datos
# (Archivos en supabase-schema.sql)
```

## 📊 URLs de Acceso

| Entorno | URL | Puerto | Estado |
|---------|-----|--------|--------|
| Desarrollo | http://localhost:3000 | 3000 | ✅ Funcionando |
| Producción Local | http://localhost:3001 | 3001 | 🔧 Configurar |
| Producción Web | https://tu-dominio.com | - | 🚀 Desplegar |

## 🔐 Seguridad de Producción

### Checklist de Seguridad
- [ ] Configurar HTTPS
- [ ] Configurar dominio personalizado
- [ ] Configurar variables de entorno seguras
- [ ] Configurar backup de base de datos
- [ ] Configurar monitoreo
- [ ] Configurar logs de errores

### Variables de Entorno Requeridas
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key
```

## 📱 Monitoreo y Analytics

### Google Analytics
```bash
NEXT_PUBLIC_GA_ID=tu_google_analytics_id
```

### Sentry (Opcional)
```bash
SENTRY_DSN=tu_sentry_dsn
```

## 🎯 Próximos Pasos

1. **Configurar Supabase** para base de datos
2. **Configurar dominio** personalizado
3. **Configurar HTTPS** para seguridad
4. **Configurar monitoreo** para producción
5. **Configurar backup** de datos
6. **Configurar CI/CD** para despliegues automáticos

## 🆘 Solución de Problemas

### Puerto en Uso
```bash
# Verificar puertos en uso
lsof -i :3000 -i :3001

# Matar procesos si es necesario
pkill -f "next dev"
```

### Error de Construcción
```bash
# Limpiar cache
rm -rf .next
npm run prod:build
```

### Error de Variables de Entorno
```bash
# Verificar archivo .env.production
cat .env.production
```

---

**¡Tu proyecto está listo para producción! 🎉**
