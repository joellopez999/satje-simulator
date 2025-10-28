# 🏛️ SATJE Simulator

**Sistema de Administración de Tribunales Judiciales Electrónicos** - Simulador para el sistema judicial ecuatoriano.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

## 🚀 Características Principales

- **⚖️ Gestión de Procesos**: Crear, editar y administrar procesos judiciales completos
- **👥 Múltiples Roles**: Jueces, secretarios, abogados y terceros con permisos específicos
- **📁 Expedientes Digitales**: Organización por instancias (primera, segunda, tercera)
- **📝 Actividades Judiciales**: Providencias, razones, escritos y otros documentos
- **🔍 Búsqueda Avanzada**: Filtros por materia, fecha, estado y más
- **📱 Interfaz Moderna**: Diseño responsive y completamente intuitivo
- **🔐 Autenticación Segura**: Sistema de login con roles y permisos
- **📊 Dashboard Completo**: Panel de control para cada tipo de usuario

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.0.4 | Framework React con SSR/SSG |
| **React** | 18 | Biblioteca de UI |
| **TypeScript** | 5 | Tipado estático |
| **Tailwind CSS** | 3.3.0 | Framework de estilos |
| **Supabase** | Latest | Base de datos y autenticación |
| **Vercel** | - | Plataforma de despliegue |
| **Railway** | - | Alternativa de despliegue |

## 📋 Prerrequisitos

- ✅ Node.js 18+ 
- ✅ npm o yarn
- ✅ Docker (para desarrollo local)
- ✅ Cuenta en [Supabase](https://supabase.com)
- ✅ Cuenta en [Vercel](https://vercel.com) (para despliegue)

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/satje-simulator.git
cd satje-simulator
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp env.example .env.local
```

### 4. Configurar Supabase
1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto
3. Obtén las credenciales de **Settings** → **API**
4. Edita `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Configurar Base de Datos
1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y ejecuta el contenido de `supabase-schema.sql`
3. Verifica que las tablas se crearon correctamente

### 6. Ejecutar la Aplicación
```bash
npm run dev
```

🌐 **La aplicación estará disponible en** `http://localhost:3000`

## 🗄️ Estructura de Base de Datos

### Tablas Principales

| Tabla | Descripción | Campos Clave |
|-------|-------------|--------------|
| **users** | Usuarios del sistema | id, email, name, role |
| **procesos** | Procesos judiciales | numero_causa, actor, demandado, materia |
| **expedientes** | Subcategorías por instancia | proceso_id, numero_expediente, instancia |
| **actividades** | Providencias, razones, escritos | expediente_id, tipo, titulo, contenido |
| **archivos** | Archivos adjuntos | actividad_id, nombre_archivo, url |
| **roles_permisos** | Permisos por rol | role, permiso, descripcion |

### 🔢 Sistema de Numeración de Causas

El sistema genera automáticamente números de causa con el formato:
```
13999-YYYY-NNNNN
```

- **13999**: Código de provincia (Manabí) + identificador del sistema
- **YYYY**: Año de creación
- **NNNNN**: Número secuencial (5 dígitos)

**Ejemplo**: `13999-2025-00123`

## 🚀 Despliegue en Producción

### 🌐 Vercel (Recomendado)

1. **Conectar Repositorio**
   - Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
   - Haz clic en "New Project"
   - Conecta tu repositorio de GitHub

2. **Configurar Variables de Entorno**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
   NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
   ```

3. **Deploy Automático**
   - Cada push a `main` desplegará automáticamente
   - Preview deployments para pull requests

### 🚂 Railway (Alternativa)

1. **Conectar Proyecto**
   - Ve a [railway.app](https://railway.app)
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio

2. **Configurar Variables**
   - Mismas variables que Vercel
   - Agregar `PORT=3000`

### 📚 Guía Completa de Despliegue

Consulta la [Guía de Despliegue](DEPLOYMENT_GUIDE.md) para instrucciones detalladas paso a paso.

## 📱 Funcionalidades del Sistema

### 🏠 Página Principal
- **Búsqueda Avanzada**: Por número de causa, actor, demandado
- **Filtros**: Materia, fechas, estado, juez asignado
- **Lista Paginada**: Resultados organizados y fáciles de navegar

### ⚖️ Gestión de Procesos
- **Crear Nueva Causa**: Formulario completo con validaciones
- **Información de Partes**: Actor, demandado, abogados
- **Asignación de Juez**: Selección automática o manual
- **Generación de Número**: Automática con formato estándar

### 📁 Expedientes Digitales
- **Múltiples Instancias**: Primera, segunda, tercera instancia
- **Organización**: Por proceso y número de expediente
- **Estado**: Activo, archivado, concluido

### 📝 Actividades Judiciales
- **Providencias**: Decisiones del juez
- **Razones**: Documentos de secretaría
- **Escritos**: Presentaciones de abogados
- **Archivos Adjuntos**: Subida y gestión de documentos

### 👥 Sistema de Roles

| Rol | Permisos | Acceso |
|-----|----------|--------|
| **Juez** | Crear procesos, providencias, ver todos | Completo |
| **Secretario** | Razones, oficios, asignar procurador | Secretaría |
| **Abogado** | Crear procesos, escritos, ver asignados | Limitado |
| **Tercero** | Crear escritos como tercero | Muy limitado |
| **Admin** | Gestión de usuarios, ver todo | Administrativo |

## 🔧 Desarrollo

### Estructura del Proyecto
```
📁 satje-simulator/
├── 📁 app/                    # Páginas de Next.js 14
│   ├── 📁 abogados/          # Módulo de abogados
│   ├── 📁 admin/            # Panel de administración
│   ├── 📁 auth/             # Autenticación
│   ├── 📁 dashboard/        # Dashboard principal
│   ├── 📁 operadores/       # Módulo de operadores
│   └── 📁 proceso/          # Gestión de procesos
├── 📁 components/           # Componentes reutilizables
├── 📁 lib/                  # Utilidades y configuración
├── 📁 sql/                  # Esquemas de base de datos
├── 📁 supabase/            # Configuración de Supabase
└── 📄 README.md            # Este archivo
```

### Scripts Disponibles
```bash
npm run dev          # Desarrollo local
npm run build        # Construcción para producción
npm run start        # Servidor de producción
npm run lint         # Linting del código
```

### 🐳 Desarrollo con Docker
```bash
# Iniciar servicios locales
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📚 Documentación

- 📖 [Guía de Despliegue](DEPLOYMENT_GUIDE.md) - Instrucciones completas de despliegue
- 🗄️ [Esquema de Base de Datos](sql/schema.sql) - Estructura de la base de datos
- ⚙️ [Configuración de Supabase](supabase/) - Configuración local
- 🔧 [Variables de Entorno](env.example) - Plantilla de configuración

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### 🐛 Reportar Bugs
- Usa el sistema de [Issues](https://github.com/tu-usuario/satje-simulator/issues)
- Incluye pasos para reproducir el problema
- Adjunta capturas de pantalla si es necesario

### ✨ Solicitar Features
- Describe la funcionalidad deseada
- Explica el caso de uso
- Considera la implementación

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [@tu-github](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por la infraestructura de base de datos
- [Next.js](https://nextjs.org) por el framework de React
- [Tailwind CSS](https://tailwindcss.com) por el sistema de diseño
- [Vercel](https://vercel.com) por la plataforma de despliegue
- La comunidad de desarrolladores por las librerías utilizadas

## 📞 Soporte

- 📧 **Email**: soporte@satje.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/satje-simulator/issues)
- 📖 **Documentación**: [Wiki del Proyecto](https://github.com/tu-usuario/satje-simulator/wiki)

---

**Última actualización**: Enero 2025 | **Versión**: 1.0.1