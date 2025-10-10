# 📋 MANUAL DEL SISTEMA SATJE v1.0
## Sistema de Administración Tributaria Judicial Electrónica

---

## 📖 ÍNDICE

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Módulos por Rol](#módulos-por-rol)
4. [Funcionalidades Detalladas](#funcionalidades-detalladas)
5. [Opciones de Selección](#opciones-de-selección)
6. [Flujos de Trabajo](#flujos-de-trabajo)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 INTRODUCCIÓN

El Sistema SATJE (Sistema de Administración Tributaria Judicial Electrónica) es una plataforma web que simula el sistema judicial ecuatoriano, permitiendo la gestión digital de procesos judiciales, expedientes electrónicos y comunicación entre los diferentes actores del sistema judicial.

### **Características Principales:**
- ✅ **Expedientes Electrónicos** con instancias múltiples
- ✅ **Búsqueda en Tiempo Real** de procesos judiciales
- ✅ **Sistema de Roles** diferenciado por usuario
- ✅ **Gestión de Archivos** con soporte PDF
- ✅ **Confirmaciones de Seguridad** para acciones críticas
- ✅ **Interfaz Responsiva** y moderna

---

## 🔐 ACCESO AL SISTEMA

### **URL de Acceso:**
```
http://localhost:3000
```

### **Credenciales de Prueba:**

| Rol | Email | Contraseña | Funciones |
|-----|-------|------------|-----------|
| **Administrador** | admin@satje.com | admin123 | Gestión completa del sistema |
| **Juez** | juez@satje.com | juez123 | Buzón de despacho, providencias |
| **Secretario** | secretario@satje.com | secretario123 | Buzón de secretaría, actuaciones |
| **Abogado** | abogado@satje.com | abogado123 | Creación de procesos, escritos |
| **Tercero** | - | - | Acceso directo sin autenticación |

### **Proceso de Login:**
1. **Acceder** a la URL del sistema
2. **Seleccionar** el rol deseado (botones de prueba)
3. **Completar** email y contraseña automáticamente
4. **Hacer clic** en "Iniciar Sesión"
5. **Ser redirigido** al dashboard correspondiente

---

## 👥 MÓDULOS POR ROL

### **🏛️ ADMINISTRADOR**
- **Dashboard** - Estadísticas generales del sistema
- **Gestión de Usuarios** - CRUD completo de usuarios
- **Administración de Procesos** - Edición y gestión de procesos
- **Todas las funciones** de otros roles

### **⚖️ JUEZ**
- **Buzón de Despacho** - Gestión de escritos pendientes
- **Crear Providencias** - Pronunciamientos judiciales
- **Gestión de Instancias** - Apertura de segunda y tercera instancia
- **Dashboard** - Estadísticas de despacho

### **📝 SECRETARIO**
- **Buzón de Secretaría** - Solicitudes del juez
- **Actuaciones de Secretaría** - Razones, oficios, notificaciones
- **Dashboard** - Estadísticas de secretaría

### **⚖️ ABOGADO**
- **Crear Nueva Causa** - Inicio de procesos judiciales
- **Ingreso de Escritos** - Presentación de escritos
- **Búsqueda de Procesos** - Consulta de expedientes

### **👤 TERCERO**
- **Envío de Escritos** - Acceso directo sin autenticación
- **Búsqueda de Procesos** - Consulta de expedientes

---

## 🔍 FUNCIONALIDADES DETALLADAS

### **1. BÚSQUEDA DE PROCESOS**

#### **Acceso:**
- **Ruta:** `/` (Página principal)
- **Disponible para:** Todos los usuarios

#### **Funcionalidades:**
- **Búsqueda en Tiempo Real** - Filtrado mientras se escribe
- **Búsqueda por Número de Causa** - Formato: `13999-YYYY-NNNNN`
- **Resultados Paginados** - 10 elementos por página
- **Información del Proceso:**
  - Número de causa
  - Actor/Plaintiff
  - Demandado/Defendant
  - Razón/Subject
  - Fecha de inicio

#### **Instrucciones de Uso:**
1. **Escribir** el número de causa en el campo de búsqueda
2. **Esperar** a que aparezcan los resultados (mínimo 3 caracteres)
3. **Hacer clic** en el número de causa para acceder al expediente
4. **Navegar** por las diferentes instancias del proceso

---

### **2. BUZÓN DE DESPACHO (JUEZ)**

#### **Acceso:**
- **Ruta:** `/operadores`
- **Disponible para:** Jueces y Administradores

#### **Funcionalidades:**
- **Estadísticas en Tiempo Real:**
  - Total de escritos (últimos 7 días)
  - Escritos pendientes
  - Escritos despachados
  - Total histórico

- **Filtros Disponibles:**
  - **Todos** - Todos los escritos
  - **Pendientes** - Escritos sin despachar
  - **Despachados** - Escritos ya procesados

- **Acciones por Escrito:**
  - **Ver Escrito** - Consultar contenido completo
  - **Crear Providencia** - Pronunciamiento judicial
  - **Marcar Despachado** - Marcar como procesado

#### **Estados de Escritos:**
- **Normal** (Verde) - Menos de 3 días
- **Urgente** (Naranja) - 3-6 días
- **Vencido** (Rojo) - 7+ días

#### **Instrucciones de Uso:**
1. **Acceder** al buzón de despacho
2. **Revisar** las estadísticas generales
3. **Filtrar** escritos según necesidad
4. **Seleccionar** acción a realizar:
   - **Ver Escrito:** Consultar contenido
   - **Crear Providencia:** Pronunciamiento judicial
   - **Marcar Despachado:** Procesar sin providencia

---

### **3. CREAR PROVIDENCIAS**

#### **Acceso:**
- **Ruta:** `/operadores/providencias`
- **Disponible para:** Jueces y Administradores

#### **Tipos de Providencias:**

##### **Providencias Indexadas (sobre escritos específicos):**
- **Auto de Admisión** - Admite el escrito presentado
- **Auto de Inadmisión** - Rechaza el escrito
- **Auto de Trámite** - Ordena trámite del proceso
- **Sentencia** - Decisión final del juez
- **Resolución** - Decisión sobre incidentes
- **Providencia** - Orden general
- **Decreto** - Orden específica
- **Oficio** - Comunicación oficial
- **Otros** - Otras providencias

##### **Providencias Autónomas (de oficio):**
- **Auto de Oficio** - Providencia de oficio
- **Sentencia** - Decisión final
- **Resolución** - Decisión sobre incidentes
- **Providencia** - Orden general
- **Decreto** - Orden específica
- **Oficio** - Comunicación oficial
- **Acumulación de Procesos** - Unir procesos
- **Otros** - Otras providencias

#### **Campos del Formulario:**
- **Tipo de Providencia** - Selección obligatoria
- **Título** - Título descriptivo
- **Contenido** - Contenido de la providencia
- **Solicitar a Secretaría** - Checkbox opcional
- **Instrucciones para Secretaría** - Campo condicional

#### **Instrucciones de Uso:**
1. **Seleccionar** tipo de providencia
2. **Completar** título y contenido
3. **Opcional:** Marcar "Solicitar actividad a Secretaría"
4. **Si se marca:** Completar instrucciones
5. **Confirmar** la acción
6. **Enviar** la providencia

---

### **4. BUZÓN DE SECRETARÍA**

#### **Acceso:**
- **Ruta:** `/operadores/buzon-secretaria`
- **Disponible para:** Secretarios y Administradores

#### **Funcionalidades:**
- **Estadísticas:**
  - Total de solicitudes (últimos 7 días)
  - Solicitudes pendientes
  - Solicitudes completadas
  - Total histórico

- **Filtros:**
  - **Todas** - Todas las solicitudes
  - **Pendientes** - Solicitudes sin completar
  - **Completadas** - Solicitudes procesadas

- **Acciones:**
  - **Crear Actividad** - Generar actuación de secretaría
  - **Marcar Completada** - Marcar como procesada

#### **Tipos de Actuaciones de Secretaría:**
- **Razón** - Actuación de secretaría
- **Oficio** - Comunicación oficial
- **Notificación** - Notificación a partes
- **Otros** - Otras actuaciones

#### **Instrucciones de Uso:**
1. **Acceder** al buzón de secretaría
2. **Revisar** solicitudes pendientes
3. **Seleccionar** "Crear Actividad"
4. **Completar** formulario de actuación
5. **Adjuntar** archivos si es necesario
6. **Enviar** la actuación

---

### **5. CREAR NUEVA CAUSA**

#### **Acceso:**
- **Ruta:** `/abogados/crear-causa`
- **Disponible para:** Abogados y Administradores

#### **Campos del Formulario:**

##### **Información del Actor:**
- **Nombre del Actor** - Nombre completo
- **Cédula del Actor** - Número de identificación
- **Correo del Actor** - Email de contacto
- **Abogado del Actor** - Nombre del abogado
- **Correo del Abogado Actor** - Email del abogado

##### **Información del Demandado:**
- **Nombre del Demandado** - Nombre completo
- **Cédula del Demandado** - Número de identificación
- **Correo del Demandado** - Email de contacto
- **Abogado del Demandado** - Nombre del abogado
- **Correo del Abogado Demandado** - Email del abogado

##### **Información del Proceso:**
- **Materia** - Área del derecho
- **Asunto** - Descripción del caso
- **Lugar** - Ubicación del proceso
- **Juez** - Juez asignado

#### **Materias Disponibles:**
- **Civil** - Derecho civil
- **Penal** - Derecho penal
- **Laboral** - Derecho laboral
- **Familia** - Derecho de familia
- **Administrativo** - Derecho administrativo
- **Constitucional** - Derecho constitucional
- **Tributario** - Derecho tributario
- **Mercantil** - Derecho mercantil

#### **Jueces Disponibles:**
- **Dr. Juan Pérez** - Juez 1
- **Dra. María García** - Juez 2
- **Dr. Carlos López** - Juez 3

#### **Instrucciones de Uso:**
1. **Completar** información del actor
2. **Completar** información del demandado
3. **Seleccionar** materia del proceso
4. **Describir** el asunto
5. **Especificar** lugar del proceso
6. **Seleccionar** juez asignado
7. **Confirmar** la creación
8. **Enviar** el formulario

---

### **6. INGRESO DE ESCRITOS**

#### **Acceso:**
- **Ruta:** `/abogados/escritos`
- **Disponible para:** Abogados y Administradores

#### **Campos del Formulario:**
- **Búsqueda de Proceso** - Búsqueda en tiempo real
- **Tipo de Petitorio** - Tipo de escrito
- **Calidad en que Comparece** - Posición en el proceso
- **Contenido del Escrito** - Texto del escrito
- **Archivo PDF** - Adjunto opcional

#### **Tipos de Petitorio:**
- **Escrito** - Escrito formal
- **Oficio** - Comunicación oficial
- **Anexos** - Documentos anexos

#### **Calidades Disponibles:**
- **Actor/Accionante/Denunciante/Legitimado Activo** - Parte demandante
- **Demandado/Accionado/Procesado/Legitimado Pasivo** - Parte demandada

#### **Instrucciones de Uso:**
1. **Buscar** el proceso por número de causa
2. **Seleccionar** el proceso de la lista
3. **Completar** tipo de petitorio
4. **Seleccionar** calidad en que comparece
5. **Escribir** contenido del escrito
6. **Adjuntar** archivo PDF si es necesario
7. **Confirmar** el envío
8. **Enviar** el escrito

---

### **7. MÓDULO DE TERCEROS**

#### **Acceso:**
- **Ruta:** `/terceros`
- **Disponible para:** Todos (sin autenticación)

#### **Campos del Formulario:**
- **Búsqueda de Proceso** - Búsqueda en tiempo real
- **Nombre del Tercero** - Nombre completo
- **Cédula del Tercero** - Número de identificación
- **Correo del Tercero** - Email de contacto
- **Tipo de Tercero** - Posición en el proceso
- **Contenido del Escrito** - Texto del escrito
- **Archivo** - Adjunto opcional

#### **Tipos de Tercero:**
- **Perito** - Experto técnico
- **Testigo** - Testigo del proceso
- **Coadyuvante** - Parte coadyuvante
- **Otros** - Otros terceros

#### **Tipos de Archivo Permitidos:**
- **PDF** - Documentos PDF
- **DOC** - Documentos Word
- **DOCX** - Documentos Word modernos

#### **Instrucciones de Uso:**
1. **Buscar** el proceso por número de causa
2. **Seleccionar** el proceso de la lista
3. **Completar** información personal
4. **Seleccionar** tipo de tercero
5. **Escribir** contenido del escrito
6. **Adjuntar** archivo si es necesario
7. **Confirmar** el envío
8. **Enviar** el escrito

---

### **8. GESTIÓN DE USUARIOS**

#### **Acceso:**
- **Ruta:** `/admin/usuarios`
- **Disponible para:** Administradores

#### **Funcionalidades:**
- **Crear Usuario** - Nuevo usuario del sistema
- **Editar Usuario** - Modificar información
- **Eliminar Usuario** - Remover usuario
- **Activar/Desactivar** - Cambiar estado
- **Ver Contraseñas** - Mostrar contraseñas temporales

#### **Campos del Usuario:**
- **Nombre** - Nombre completo
- **Email** - Dirección de correo
- **Rol** - Función en el sistema
- **Estado** - Activo/Inactivo
- **Contraseña** - Generada automáticamente

#### **Roles Disponibles:**
- **Administrador** - Acceso completo
- **Juez** - Funciones judiciales
- **Secretario** - Funciones de secretaría
- **Abogado** - Funciones de abogado

#### **Instrucciones de Uso:**
1. **Acceder** a gestión de usuarios
2. **Hacer clic** en "Crear Usuario"
3. **Completar** información básica
4. **Seleccionar** rol del usuario
5. **Generar** contraseña temporal
6. **Guardar** el usuario
7. **Compartir** credenciales con el usuario

---

### **9. GESTIÓN DE INSTANCIAS**

#### **Acceso:**
- **Ruta:** `/operadores/instancias`
- **Disponible para:** Jueces y Administradores

#### **Funcionalidades:**
- **Abrir Segunda Instancia** - Proceso de apelación
- **Abrir Tercera Instancia** - Proceso extraordinario
- **Seleccionar Tipo** - Especificar tipo de recurso

#### **Tipos de Segunda Instancia:**
- **Apelación** - Recurso de apelación
- **Recurso de Apelación** - Apelación formal
- **Recurso de Casación** - Casación
- **Recurso de Revisión** - Revisión
- **Recurso de Amparo** - Amparo constitucional
- **Recurso de Hábeas Corpus** - Hábeas corpus
- **Recurso de Hábeas Data** - Hábeas data
- **Recurso de Inconstitucionalidad** - Inconstitucionalidad
- **Recurso de Protección** - Protección
- **Otros** - Otros recursos

#### **Tipos de Tercera Instancia:**
- **Recurso Extraordinario de Casación** - Casación extraordinaria
- **Recurso de Revisión Extraordinario** - Revisión extraordinaria
- **Recurso de Amparo Extraordinario** - Amparo extraordinario
- **Recurso de Inconstitucionalidad Extraordinario** - Inconstitucionalidad extraordinaria
- **Recurso de Protección Extraordinario** - Protección extraordinaria
- **Recurso de Hábeas Corpus Extraordinario** - Hábeas corpus extraordinario
- **Recurso de Hábeas Data Extraordinario** - Hábeas data extraordinario
- **Otros** - Otros recursos extraordinarios

#### **Instrucciones de Uso:**
1. **Buscar** el proceso por número de causa
2. **Seleccionar** el proceso de la lista
3. **Elegir** tipo de instancia (segunda o tercera)
4. **Seleccionar** tipo de recurso
5. **Confirmar** la apertura
6. **Crear** la nueva instancia

---

## 📋 OPCIONES DE SELECCIÓN

### **🔍 BÚSQUEDA DE PROCESOS**
- **Campo:** Número de causa
- **Formato:** `13999-YYYY-NNNNN`
- **Ejemplo:** `13999-2024-00001`
- **Búsqueda:** Mínimo 3 caracteres

### **⚖️ TIPOS DE PROVIDENCIAS**

#### **Providencias Indexadas:**
- `auto_admision` - Auto de Admisión
- `auto_inadmision` - Auto de Inadmisión
- `auto_tramite` - Auto de Trámite
- `sentencia` - Sentencia
- `resolucion` - Resolución
- `providencia` - Providencia
- `decreto` - Decreto
- `oficio` - Oficio
- `otros` - Otros

#### **Providencias Autónomas:**
- `auto_oficio` - Auto de Oficio
- `sentencia` - Sentencia
- `resolucion` - Resolución
- `providencia` - Providencia
- `decreto` - Decreto
- `oficio` - Oficio
- `acumulacion` - Acumulación de Procesos
- `otros` - Otros

### **📝 TIPOS DE PETITORIO**
- `Escrito` - Escrito formal
- `Oficio` - Comunicación oficial
- `Anexos` - Documentos anexos

### **👤 CALIDADES EN QUE COMPARECE**
- `Actor/Accionante/Denunciante/Legitimado Activo` - Parte demandante
- `Demandado/Accionado/Procesado/Legitimado Pasivo` - Parte demandada

### **🏛️ MATERIAS JUDICIALES**
- `Civil` - Derecho civil
- `Penal` - Derecho penal
- `Laboral` - Derecho laboral
- `Familia` - Derecho de familia
- `Administrativo` - Derecho administrativo
- `Constitucional` - Derecho constitucional
- `Tributario` - Derecho tributario
- `Mercantil` - Derecho mercantil

### **👨‍⚖️ JUECES DISPONIBLES**
- `juez1` - Dr. Juan Pérez
- `juez2` - Dra. María García
- `juez3` - Dr. Carlos López

### **📋 TIPOS DE ACTUACIONES DE SECRETARÍA**
- `Razon` - Razón
- `Oficio` - Oficio
- `Notificacion` - Notificación
- `Otros` - Otros

### **👥 TIPOS DE TERCERO**
- `perito` - Perito
- `testigo` - Testigo
- `coadyuvante` - Coadyuvante
- `otros` - Otros

### **🔐 ROLES DE USUARIO**
- `admin` - Administrador
- `juez` - Juez
- `secretario` - Secretario
- `abogado` - Abogado

### **📁 TIPOS DE ARCHIVO PERMITIDOS**
- **PDF:** `application/pdf`
- **DOC:** `application/msword`
- **DOCX:** `application/vnd.openxmlformats-officedocument.wordprocessor`

---

## 🔄 FLUJOS DE TRABAJO

### **1. FLUJO COMPLETO DE UN PROCESO**

#### **Paso 1: Creación del Proceso**
1. **Abogado** accede al sistema
2. **Crea nueva causa** con información completa
3. **Sistema genera** número de causa automáticamente
4. **Proceso queda** en estado "Activo"

#### **Paso 2: Ingreso de Escritos**
1. **Abogado** busca el proceso
2. **Ingresa escrito** con contenido y archivos
3. **Escrito aparece** en buzón de despacho del juez
4. **Estado:** Pendiente de despacho

#### **Paso 3: Despacho Judicial**
1. **Juez** revisa buzón de despacho
2. **Crea providencia** sobre el escrito
3. **Opcional:** Solicita actividad a secretaría
4. **Escrito se marca** como despachado

#### **Paso 4: Actuaciones de Secretaría**
1. **Secretario** recibe solicitud del juez
2. **Crea actuación** correspondiente
3. **Adjunta archivos** si es necesario
4. **Marca solicitud** como completada

#### **Paso 5: Seguimiento**
1. **Todas las partes** pueden consultar el expediente
2. **Actividades se registran** cronológicamente
3. **Archivos quedan** disponibles para consulta

### **2. FLUJO DE APELACIÓN**

#### **Paso 1: Apertura de Segunda Instancia**
1. **Juez** accede a gestión de instancias
2. **Busca proceso** original
3. **Selecciona tipo** de recurso
4. **Sistema crea** expediente de segunda instancia

#### **Paso 2: Proceso de Apelación**
1. **Partes pueden** presentar escritos
2. **Juez puede** crear providencias
3. **Secretario puede** realizar actuaciones
4. **Proceso se desarrolla** independientemente

#### **Paso 3: Tercera Instancia (si aplica)**
1. **Juez** puede abrir tercera instancia
2. **Proceso extraordinario** se inicia
3. **Mismas funcionalidades** que segunda instancia

### **3. FLUJO DE TERCEROS**

#### **Paso 1: Acceso Directo**
1. **Tercero** accede sin autenticación
2. **Busca proceso** por número de causa
3. **Completa formulario** con información personal
4. **Envía escrito** al sistema

#### **Paso 2: Procesamiento**
1. **Escrito aparece** en buzón de despacho
2. **Juez puede** crear providencia
3. **Información del tercero** se registra
4. **Escrito se integra** al expediente

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### **❌ PROBLEMAS COMUNES**

#### **1. Error de Autenticación**
- **Síntoma:** Redirección al login después de iniciar sesión
- **Solución:** Verificar que el usuario existe en el sistema
- **Prevención:** Usar credenciales de prueba correctas

#### **2. Búsqueda No Encuentra Resultados**
- **Síntoma:** No aparecen procesos en la búsqueda
- **Solución:** Verificar que el proceso existe y está activo
- **Prevención:** Usar formato correcto del número de causa

#### **3. Error al Subir Archivos**
- **Síntoma:** Error 404 al ver archivos subidos
- **Solución:** Verificar que el archivo es PDF válido
- **Prevención:** Usar solo archivos PDF para escritos de abogados

#### **4. Formulario No Se Envía**
- **Síntoma:** Botón de envío no responde
- **Solución:** Verificar que todos los campos requeridos están completos
- **Prevención:** Revisar validaciones del formulario

#### **5. Datos No Se Guardan**
- **Síntoma:** Información no persiste entre sesiones
- **Solución:** Verificar que localStorage está habilitado
- **Prevención:** No usar modo incógnito del navegador

### **🔧 MANTENIMIENTO**

#### **Limpieza de Datos:**
- **LocalStorage:** Se puede limpiar desde el navegador
- **Datos de Prueba:** Se pueden regenerar desde administración
- **Usuarios:** Se pueden eliminar desde gestión de usuarios

#### **Respaldo de Datos:**
- **Exportar:** Datos se pueden exportar desde localStorage
- **Importar:** Datos se pueden importar desde archivos JSON
- **Sincronización:** Datos se sincronizan automáticamente

### **📞 SOPORTE TÉCNICO**

#### **Información del Sistema:**
- **Versión:** 1.0
- **Tecnología:** Next.js + TypeScript
- **Almacenamiento:** LocalStorage
- **Navegadores:** Chrome, Firefox, Safari, Edge

#### **Logs del Sistema:**
- **Actividad de Usuarios:** Se registran en localStorage
- **Errores:** Se muestran en consola del navegador
- **Acciones:** Se registran con timestamp y usuario

---

## 📚 GLOSARIO

### **Términos Técnicos:**
- **Expediente Electrónico:** Documento digital que contiene todas las actuaciones de un proceso judicial
- **Providencia:** Decisión o pronunciamiento del juez
- **Escrito:** Documento presentado por las partes en el proceso
- **Actuación:** Cualquier acción realizada en el expediente
- **Instancia:** Nivel del proceso judicial (primera, segunda, tercera)

### **Términos del Sistema:**
- **Buzón de Despacho:** Área donde el juez gestiona escritos pendientes
- **Buzón de Secretaría:** Área donde el secretario gestiona solicitudes del juez
- **Dashboard:** Panel de control con estadísticas del sistema
- **Rol:** Función o posición del usuario en el sistema
- **Autenticación:** Proceso de verificación de identidad del usuario

---

## 🎯 CONCLUSIÓN

El Sistema SATJE v1.0 es una plataforma completa para la gestión de procesos judiciales electrónicos, que simula el sistema judicial ecuatoriano con todas las funcionalidades necesarias para el manejo digital de expedientes, comunicación entre actores judiciales y seguimiento de procesos.

### **Características Destacadas:**
- ✅ **Interfaz Intuitiva** - Fácil de usar para todos los usuarios
- ✅ **Seguridad Integrada** - Confirmaciones para acciones críticas
- ✅ **Flexibilidad** - Múltiples roles y funcionalidades
- ✅ **Escalabilidad** - Preparado para crecimiento
- ✅ **Mantenibilidad** - Código limpio y documentado

### **Próximos Pasos:**
- 🔄 **Migración a Supabase** - Base de datos en la nube
- 🚀 **Despliegue en Producción** - Vercel + Railway
- 📱 **Aplicación Móvil** - Versión para dispositivos móviles
- 🔐 **Autenticación Avanzada** - OAuth y 2FA
- 📊 **Analytics Avanzados** - Métricas detalladas del sistema

---

**© 2024 Sistema SATJE v1.0 - Todos los derechos reservados**
