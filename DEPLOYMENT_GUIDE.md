# 🚀 Guía de Despliegue a Producción - SATJE

Esta guía te ayudará a desplegar tu aplicación SATJE en producción usando **Vercel**, **Railway** y **Supabase**.

## 📋 Prerrequisitos

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Cuenta en [Railway](https://railway.app) (opcional)
- ✅ Cuenta en [Supabase](https://supabase.com)
- ✅ Repositorio en GitHub/GitLab

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear Proyecto en Supabase
1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Haz clic en "New Project"
3. Elige tu organización
4. Configura:
   - **Name**: `satje-production`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana a tus usuarios

### 1.2 Configurar Base de Datos
1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y ejecuta el contenido de `supabase-schema.sql`
3. Verifica que las tablas se crearon correctamente

### 1.3 Obtener Credenciales
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**
   - **anon public** key
   - **service_role** key (¡mantén esto secreto!)

## 🌐 Paso 2: Desplegar en Vercel

### 2.1 Conectar Repositorio
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en "New Project"
3. Conecta tu repositorio de GitHub
4. Selecciona el proyecto SATJE

### 2.2 Configurar Variables de Entorno
En la configuración del proyecto en Vercel, agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

### 2.3 Configurar Dominio Personalizado (Opcional)
1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones

## 🚂 Paso 3: Desplegar en Railway (Opcional)

### 3.1 Conectar Proyecto
1. Ve a [railway.app](https://railway.app)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

### 3.2 Configurar Variables de Entorno
En Railway, agrega las mismas variables que en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
NEXT_PUBLIC_APP_URL=https://tu-dominio.railway.app
PORT=3000
```

## 🔧 Paso 4: Configuración de Producción

### 4.1 Actualizar Configuración de Supabase
1. Ve a **Authentication** → **URL Configuration**
2. Agrega tu dominio de Vercel en:
   - **Site URL**: `https://tu-dominio.vercel.app`
   - **Redirect URLs**: `https://tu-dominio.vercel.app/auth/callback`

### 4.2 Configurar CORS
1. Ve a **Settings** → **API**
2. En **CORS**, agrega tu dominio de Vercel

### 4.3 Configurar Storage (Si usas archivos)
1. Ve a **Storage**
2. Crea un bucket llamado `satje-files`
3. Configura las políticas de acceso

## 🧪 Paso 5: Verificar Despliegue

### 5.1 Pruebas Básicas
- [ ] La aplicación carga correctamente
- [ ] El login funciona
- [ ] Se pueden crear procesos
- [ ] Los archivos se suben correctamente

### 5.2 Pruebas de Rendimiento
- [ ] Tiempo de carga < 3 segundos
- [ ] Responsive en móviles
- [ ] Funciona en diferentes navegadores

## 🔒 Paso 6: Configuración de Seguridad

### 6.1 Variables de Entorno Seguras
- ✅ Nunca commits las claves reales
- ✅ Usa variables de entorno en producción
- ✅ Rota las claves periódicamente

### 6.2 Configuración de Supabase
- ✅ Habilita RLS (Row Level Security)
- ✅ Configura políticas de acceso
- ✅ Monitorea el uso de la API

## 📊 Paso 7: Monitoreo y Mantenimiento

### 7.1 Vercel Analytics
1. Habilita Vercel Analytics en tu proyecto
2. Monitorea el rendimiento y errores

### 7.2 Supabase Dashboard
1. Monitorea el uso de la base de datos
2. Revisa los logs de autenticación
3. Configura alertas de uso

## 🚨 Solución de Problemas Comunes

### Error: "Invalid API key"
- Verifica que las claves de Supabase sean correctas
- Asegúrate de que las variables de entorno estén configuradas

### Error: "CORS policy"
- Verifica la configuración de CORS en Supabase
- Agrega tu dominio a las URLs permitidas

### Error: "Database connection failed"
- Verifica que el esquema se ejecutó correctamente
- Revisa las políticas de RLS

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel/Railway
2. Consulta la documentación de Supabase
3. Verifica la configuración de variables de entorno

## 🎉 ¡Despliegue Completado!

Tu aplicación SATJE debería estar funcionando en producción. Recuerda:
- Monitorear el rendimiento
- Hacer backups regulares
- Mantener las dependencias actualizadas
- Revisar los logs periódicamente

---

**Última actualización**: Enero 2025
**Versión**: 1.0
