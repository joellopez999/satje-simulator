# 🚀 Guía de Setup - SATJE en Otra Máquina

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Git** (para clonar el repositorio)
- ✅ **Docker Desktop** (para ejecutar los contenedores)
- ✅ **Node.js 18+** (opcional, solo si quieres ejecutar sin Docker)

## 📥 Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio desde GitHub
git clone https://github.com/joellopez999/satje-simulator.git

# Entrar al directorio
cd satje-simulator

# Verificar que estás en la rama main
git branch
# Debería mostrar: * main

# Ver el último commit (debe ser 33815e7)
git log --oneline -1
# Debería mostrar: 33815e7 feat: Complete audit system with API routes, UUID validation, and migration tools
```

## 🔑 Paso 2: Configurar Variables de Entorno

### Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Supabase Configuration (Remote)
NEXT_PUBLIC_SUPABASE_URL=https://zriwxjdetsjovxoohkxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyaXd4amRldHNqb3Z4b29oa3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTAwOTQsImV4cCI6MjA3NTY2NjA5NH0.-H8DWgYnsWZ7D2j1yro5XCp0d_Xx3i8VpxcCp8Q0brU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyaXd4amRldHNqb3Z4b29oa3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA5MDA5NCwiZXhwIjoyMDc1NjY2MDk0fQ.hpTZG3f_95ktV-gZ8quOWikmPJ3zroj3ujSrAwU_L0I

# Telegram Configuration
TELEGRAM_BOT_TOKEN=8498460518:AAEbpoLmb4KfmDezZyQV-GltZShAPcSMUcs
NEXT_PUBLIC_TELEGRAM_CHAT_ID=250790216
N8N_WEBHOOK_URL=your_n8n_webhook_url

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudflare Tunnel
TUNNEL_TOKEN=eyJhIjoiM2Q3NWQxY2NjOWMwOTJhODE4YTY1YWNjZDUyNjE4YzUiLCJ0IjoiOGJlYzZiOGMtZDNmMS00ZjU5LWEwNWYtOWJkYWRiYmIxOTNhIiwicyI6Ik1USm1ORGc1TUdJdFl6STVZUzAwTlRjMUxUZzBObVF0WTJNM056WmhNREExTXpNMyJ9
```

### Verificar que el archivo existe

```bash
# Verificar que el archivo se creó correctamente
ls -la .env.local

# Ver el contenido (opcional)
cat .env.local
```

## 🐳 Paso 3: Ejecutar con Docker

### Opción A: Usando Docker Compose (Recomendado)

```bash
# Construir y ejecutar los contenedores
docker-compose up -d --build

# Esto creará y ejecutará:
# - satje-app (aplicación Next.js en puerto 3000)
# - satje-tunnel (Cloudflare tunnel para acceso público)
```

### Verificar que los contenedores están corriendo

```bash
# Ver contenedores en ejecución
docker ps

# Deberías ver:
# CONTAINER ID   IMAGE                           STATUS         PORTS                    NAMES
# xxxxxxxxxx     copiadessatje-production-app    Up X seconds   0.0.0.0:3000->3000/tcp   satje-app
# xxxxxxxxxx     cloudflare/cloudflared:latest   Up X seconds                            satje-tunnel
```

### Ver logs de los contenedores

```bash
# Ver logs de la aplicación
docker logs satje-app -f

# Ver logs del tunnel (en otra terminal)
docker logs satje-tunnel -f

# Deberías ver:
# ▲ Next.js 14.0.4
# - Local:        http://localhost:3000
# ✓ Ready in XXms
```

## 🌐 Paso 4: Verificar Acceso

### Local

Abre tu navegador en: **http://localhost:3000**

Deberías ver la página de búsqueda de procesos de SATJE.

### Público (Cloudflare Tunnel)

Abre tu navegador en: **https://satje.lopezysocios.org**

El tunnel de Cloudflare debería estar activo y redirigiendo el tráfico a tu máquina local.

## 🔧 Comandos Útiles de Docker

### Gestión de Contenedores

```bash
# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Detener contenedores
docker-compose down

# Reiniciar contenedores
docker-compose restart

# Reconstruir y reiniciar (después de cambios en código)
docker-compose up -d --build

# Ver logs en tiempo real
docker logs satje-app -f
docker logs satje-tunnel -f
```

### Debugging

```bash
# Entrar al contenedor de la app
docker exec -it satje-app sh

# Ver variables de entorno en el contenedor
docker exec satje-app env | grep SUPABASE

# Ver uso de recursos
docker stats

# Limpiar contenedores detenidos e imágenes no usadas
docker system prune -a
```

## 🔄 Opción B: Ejecutar sin Docker (Desarrollo)

Si prefieres ejecutar sin Docker para desarrollo:

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

**Nota**: En modo desarrollo, el Cloudflare tunnel NO se ejecutará automáticamente.

## 🔐 Credenciales de Acceso

### Usuarios de Prueba

El sistema tiene usuarios de prueba pre-configurados:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@satje.com | admin123 |
| Juez | juez@satje.com | juez123 |
| Secretario | secretario@satje.com | secretario123 |
| Abogado | abogado@satje.com | abogado123 |

### Acceso Rápido

En la página de login, hay botones de "Acceso Rápido por Rol" que llenan automáticamente las credenciales.

## 📊 Verificar Conexión a Supabase

### Desde la Interfaz

1. Hacer login como admin
2. Ir a **Administración → Estado del Sistema**
3. Verificar que aparezca: "✅ Conectado a Base de Datos Remota"

### Desde la Terminal

```bash
# Verificar que las variables de entorno están configuradas
docker exec satje-app env | grep SUPABASE_SERVICE_ROLE_KEY

# Debería mostrar la key (parcialmente oculta por seguridad)
```

## 🛠️ Herramientas de Migración

Si tienes procesos sin expedientes (creados antes del fix), ejecuta la migración:

1. Login como admin
2. Ir a **Administración → Estado del Sistema**
3. Scroll hasta "Herramientas de Migración"
4. Clic en **"Ejecutar Migración"**
5. Confirmar

Esto creará expedientes de primera instancia para todos los procesos que no los tengan.

## 🌐 Cloudflare Tunnel

### Verificar Estado del Tunnel

```bash
# Ver logs del tunnel
docker logs satje-tunnel

# Deberías ver:
# ✓ Registered tunnel connection (gye01, quic)
# ✓ Registered tunnel connection (mia04, quic)
# ✓ Updated to new configuration
```

### Configuración del Tunnel

El tunnel está configurado para:
- **Hostname**: satje.lopezysocios.org
- **Service**: http://app:3000 (contenedor interno)
- **Protocol**: QUIC

El token del tunnel ya está en el archivo `.env.local` y se configura automáticamente.

## 🔄 Sincronización entre Máquinas

### Antes de cambiar de máquina

En la máquina actual:
```bash
# Asegurarse de que todo está guardado
git status

# Si hay cambios, hacer commit
git add .
git commit -m "Descripción de cambios"
git push origin main

# Detener Docker
docker-compose down
```

### En la nueva máquina

```bash
# Actualizar código
git pull origin main

# Reiniciar contenedores
docker-compose up -d --build
```

## ⚠️ Troubleshooting

### Problema: Contenedores no inician

```bash
# Ver logs de error
docker-compose logs

# Verificar que el puerto 3000 no esté en uso
lsof -i :3000

# Si está en uso, detener el proceso o cambiar el puerto en docker-compose.yml
```

### Problema: Error de variables de entorno

```bash
# Verificar que .env.local existe
ls -la .env.local

# Verificar contenido
cat .env.local

# Reconstruir contenedores
docker-compose down
docker-compose up -d --build
```

### Problema: Tunnel no conecta

```bash
# Ver logs del tunnel
docker logs satje-tunnel -f

# Verificar que el TUNNEL_TOKEN es correcto en .env.local
# Reiniciar solo el tunnel
docker-compose restart tunnel
```

### Problema: Error al crear actividades

```bash
# Verificar que SUPABASE_SERVICE_ROLE_KEY está configurado
docker exec satje-app env | grep SUPABASE_SERVICE_ROLE_KEY

# Ver logs de la app
docker logs satje-app -f

# Intentar crear una actividad y ver el error en los logs
```

## 📚 Recursos Adicionales

### Documentación del Proyecto

- **Walkthrough**: Ver `/Users/joellopez/.gemini/antigravity/brain/fa904ed9-c29f-4dc9-a046-29d91d6b57d1/walkthrough.md`
- **Task List**: Ver `/Users/joellopez/.gemini/antigravity/brain/abece40c-88f5-483d-80a2-45365ab0b36d/task.md`

### URLs Importantes

- **Aplicación Local**: http://localhost:3000
- **Aplicación Pública**: https://satje.lopezysocios.org
- **Supabase Dashboard**: https://supabase.com/dashboard/project/zriwxjdetsjovxoohkxi
- **GitHub Repo**: https://github.com/joellopez999/satje-simulator

### Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│         Cloudflare Network              │
│  satje.lopezysocios.org (HTTPS)         │
└────────────────┬────────────────────────┘
                 │
                 │ Cloudflare Tunnel (QUIC)
                 │
┌────────────────▼────────────────────────┐
│      Docker Container: satje-tunnel     │
│   cloudflare/cloudflared:latest         │
└────────────────┬────────────────────────┘
                 │
                 │ HTTP (Internal Network)
                 │
┌────────────────▼────────────────────────┐
│      Docker Container: satje-app        │
│   Next.js 14.0.4 (Production Mode)      │
│   Port: 3000                            │
│                                         │
│   API Routes:                           │
│   - /api/activities/create              │
│   - /api/users/upsert                   │
│   - /api/processes/search               │
│   - /api/processes/create               │
│   - /api/processes/migrate-expedientes  │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────┐
│         Supabase Cloud                  │
│  zriwxjdetsjovxoohkxi.supabase.co      │
└─────────────────────────────────────────┘
```

## ✅ Checklist de Setup

- [ ] Git instalado
- [ ] Docker Desktop instalado y corriendo
- [ ] Repositorio clonado
- [ ] Archivo `.env.local` creado con todas las variables
- [ ] `docker-compose up -d --build` ejecutado
- [ ] Contenedores corriendo (`docker ps`)
- [ ] Aplicación accesible en http://localhost:3000
- [ ] Tunnel activo en https://satje.lopezysocios.org
- [ ] Login exitoso con usuario de prueba
- [ ] Conexión a Supabase verificada

## 🎉 ¡Listo!

Si completaste todos los pasos del checklist, el sistema SATJE debería estar funcionando correctamente en tu nueva máquina.

Para cualquier problema, revisa la sección de **Troubleshooting** o consulta los logs de Docker.

---

**Última actualización**: 2025-11-25
**Commit**: 33815e7
**Versión**: Sistema de Auditoría Completo
