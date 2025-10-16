# SATJE Simulator - PRODUCCIÓN

## 🚀 Versión de Producción

Esta es la versión de producción del Sistema Automático de Trámite Judicial Ecuatoriano (SATJE).

### 📋 Diferencias con Desarrollo

- **Puerto**: 3001 (desarrollo usa 3000)
- **Base de datos**: Preparado para Supabase
- **Configuración**: Optimizada para producción
- **Logs**: Configurados para producción

### 🛠️ Configuración de Producción

#### 1. Variables de Entorno
```bash
# .env.production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key
```

#### 2. Scripts de Producción
```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build

# Iniciar en modo producción
npm run start

# O iniciar en puerto específico
npm run dev -- -p 3001
```

### 🌐 Despliegue

#### Opción 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

#### Opción 2: Netlify
```bash
# Construir
npm run build

# Subir carpeta 'out' a Netlify
```

#### Opción 3: Servidor Propio
```bash
# Construir
npm run build

# Iniciar servidor
npm run start
```

### 🔧 Configuración de Base de Datos

1. **Crear proyecto en Supabase**
2. **Configurar variables de entorno**
3. **Ejecutar migraciones**
4. **Configurar autenticación**

### 📱 URLs de Acceso

- **Desarrollo**: http://localhost:3000
- **Producción**: http://localhost:3001 (local) o tu-dominio.com

### 🔐 Seguridad de Producción

- [ ] Configurar HTTPS
- [ ] Configurar dominio personalizado
- [ ] Configurar variables de entorno seguras
- [ ] Configurar backup de base de datos
- [ ] Configurar monitoreo

### 📊 Monitoreo

- [ ] Configurar Google Analytics
- [ ] Configurar logs de errores
- [ ] Configurar métricas de rendimiento

---

**Nota**: Este proyecto está separado del desarrollo para mantener la estabilidad de producción.
