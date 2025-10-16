# SATJE Simulator

Sistema Automático de Trámite Judicial Ecuatoriano - Simulador

Una aplicación web que simula el funcionamiento del SATJE (Sistema Automático de Trámite Judicial Ecuatoriano) y el Casillero Judicial Electrónico, permitiendo la gestión digital de procesos judiciales.

## 🚀 Características

### Funcionalidades Principales
- **Búsqueda de Procesos**: Búsqueda por número de causa con filtros avanzados
- **Gestión de Expedientes**: Subcategorización por instancias (primera, segunda, tercera)
- **Sistema de Roles**: Jueces, Secretarios, Abogados, Terceros y Administradores
- **Actividades Judiciales**: Providencias, razones, escritos y otros documentos
- **Carga de Archivos**: Soporte para documentos PDF
- **Acumulación de Procesos**: Funcionalidad para acumular procesos relacionados

### Roles del Sistema
- **Jueces**: Crear providencias, acumular procesos, gestionar expedientes
- **Secretarios**: Crear razones, oficios, asignar procuradores judiciales
- **Abogados**: Crear causas, ingresar escritos, gestionar procesos
- **Terceros**: Ingresar escritos como peritos, testigos, coadyuvantes
- **Administradores**: Gestionar usuarios y roles del sistema

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (Frontend), Railway (Backend)
- **UI Components**: Lucide React Icons

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de Vercel (para deployment)
- Cuenta de Railway (opcional, para base de datos)

## 🚀 Instalación Local

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd SSATJE
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase
```bash
# Ejecutar script de configuración automática
./scripts/setup-supabase.sh
```

### 4. Configurar variables de entorno
```bash
# Editar .env.local con tus credenciales de Supabase
# Obtén las credenciales de: https://supabase.com/dashboard
```

### 5. Configurar base de datos

#### Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén la URL y las claves de tu proyecto

#### Ejecutar esquema de base de datos
1. Ve a la sección SQL Editor en tu dashboard de Supabase
2. Copia y ejecuta el contenido de `supabase-schema.sql`
3. Opcionalmente, ejecuta `supabase/seed.sql` para datos de ejemplo

### 6. Ejecutar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de Base de Datos

### Tablas Principales
- **users**: Usuarios del sistema con roles
- **procesos**: Procesos judiciales principales
- **expedientes**: Subcategorías por instancia
- **actividades**: Providencias, razones, escritos
- **archivos**: Archivos adjuntos
- **roles_permisos**: Permisos por rol

### Número de Causa
El sistema genera automáticamente números de causa con el formato:
```
13999-YYYY-NNNNN
```
- **13999**: Código de provincia (Manabí) + identificador del sistema
- **YYYY**: Año de creación
- **NNNNN**: Número secuencial (5 dígitos)

## 🚀 Deployment

### Frontend (Vercel)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push

### Base de Datos (Supabase)
- La base de datos ya está configurada en Supabase
- No requiere configuración adicional

### Variables de Entorno para Producción
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_produccion
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_produccion
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

## 📱 Uso del Sistema

### 1. Página Principal
- Búsqueda por número de causa
- Filtros avanzados (materia, fechas, estado)
- Lista paginada de resultados

### 2. Crear Nueva Causa
- Formulario completo con información de las partes
- Selección de juez y materia
- Generación automática del número de causa

### 3. Gestión de Expedientes
- Vista por instancias (primera, segunda, tercera)
- Actividades cronológicas
- Desglose de contenido

### 4. Ingreso de Escritos
- Búsqueda del proceso destino
- Opción de texto directo o archivo PDF
- Selección de calidad procesal

## 🔐 Seguridad

- Autenticación con Supabase Auth
- Row Level Security (RLS) en todas las tablas
- Políticas de acceso basadas en roles
- Validación de permisos en frontend y backend

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
npm run test

# Linting
npm run lint
```

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Soporte

Para soporte técnico o preguntas sobre el sistema, contacta al equipo de desarrollo.

## 📞 Contacto

- **Desarrollador**: [Tu nombre]
- **Email**: [tu-email@ejemplo.com]
- **Proyecto**: SATJE Simulator

---

**Nota**: Este es un simulador educativo del SATJE ecuatoriano. Para uso en producción, se requieren validaciones adicionales y cumplimiento de normativas legales específicas.
