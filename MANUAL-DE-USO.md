# 📖 Manual de Uso - Sistema de Gestión para Ferretería

---

## 📑 Tabla de Contenidos

1. [Cómo se Usa](#1-cómo-se-usa)
   - [Inicio de Sesión](#11-inicio-de-sesión)
   - [Navegación Principal](#12-navegación-principal)
   - [Dashboard](#13-dashboard)
   - [Gestión de Inventario](#14-gestión-de-inventario)
   - [Gestión de Proveedores](#15-gestión-de-proveedores)
   - [Sistema de Facturación](#16-sistema-de-facturación)
   - [Gestión de Clientes](#17-gestión-de-clientes)
   - [Reportes](#18-reportes)
   - [Configuración](#19-configuración)

2. [Cómo Funciona](#2-cómo-funciona)
   - [Arquitectura del Sistema](#21-arquitectura-del-sistema)
   - [Sistema de Autenticación](#22-sistema-de-autenticación)
   - [Roles y Permisos](#23-roles-y-permisos)
   - [Flujo de Datos](#24-flujo-de-datos)
   - [Base de Datos](#25-base-de-datos)
   - [Gestión de Estado](#26-gestión-de-estado)

3. [Tecnologías Utilizadas y Detalles Extra](#3-tecnologías-utilizadas-y-detalles-extra)
   - [Stack Tecnológico](#31-stack-tecnológico)
   - [Librerías y Dependencias](#32-librerías-y-dependencias)
   - [Estructura del Proyecto](#33-estructura-del-proyecto)
   - [Características Especiales](#34-características-especiales)
   - [Seguridad](#35-seguridad)
   - [Rendimiento](#36-rendimiento)

---

## 1. Cómo se Usa

### 1.1 Inicio de Sesión

#### Acceso al Sistema
1. **Abrir la aplicación** en tu navegador web
2. Se mostrará la pantalla de inicio de sesión
3. **Ingresar credenciales:**
   - Usuario (username)
   - Contraseña
4. Hacer clic en **"Iniciar Sesión"**

#### Tipos de Usuario
El sistema cuenta con 3 tipos de usuarios, cada uno con permisos específicos:

- **👑 Administrador (admin):** Acceso completo a todas las funcionalidades
- **💳 Cajero:** Acceso a inventario, facturación, clientes y reportes
- **📦 Bodega:** Acceso limitado a inventario y reportes

### 1.2 Navegación Principal

La interfaz está dividida en dos áreas principales:

#### Barra Lateral (Sidebar)
- **Logo y nombre de la empresa** en la parte superior
- **Menú de navegación** con iconos identificables:
  - 📊 Dashboard
  - 📦 Inventario
  - 👥 Proveedores
  - 📄 Facturación
  - 👤 Clientes
  - 📈 Reportes
  - ⚙️ Configuración
- **Información del perfil** en la parte inferior

#### Barra Superior (Header)
- **Botón de menú** (para mostrar/ocultar sidebar)
- **Título de la sección actual**
- **Información del usuario:**
  - Icono de rol
  - Nombre del usuario
  - Botón "Salir"
- **Fecha actual** (formato colombiano)

### 1.3 Dashboard

El Dashboard es la vista principal que muestra un resumen general del negocio.

#### Elementos del Dashboard:
- **📊 Tarjetas de métricas principales:**
  - Ventas del mes
  - Productos en inventario
  - Clientes activos
  - Pedidos pendientes

- **📈 Gráficos visuales:**
  - Tendencia de ventas
  - Productos más vendidos
  - Comparativas mensuales

- **⚡ Alertas importantes:**
  - Productos con bajo stock
  - Productos próximos a vencer
  - Pedidos pendientes

### 1.4 Gestión de Inventario

Esta sección permite administrar todos los productos de la ferretería.

#### Funcionalidades Principales:

##### 1.4.1 Ver Inventario
- **Tabla de productos** con columnas:
  - Código/SKU
  - Nombre del producto
  - Categoría
  - Proveedor
  - Stock actual
  - Precio de compra
  - Precio de venta
  - Estado
  - Acciones

- **Búsqueda y filtros:**
  - Buscar por nombre o código
  - Filtrar por categoría
  - Filtrar por proveedor
  - Filtrar por estado (activo/inactivo)

##### 1.4.2 Agregar Producto
1. Hacer clic en **"+ Nuevo Producto"**
2. Completar el formulario:
   - Código/SKU (único)
   - Nombre del producto
   - Descripción
   - Categoría
   - Proveedor
   - Stock inicial
   - Stock mínimo (para alertas)
   - Precio de compra
   - Precio de venta
   - Fecha de vencimiento (opcional)
   - Ubicación en bodega
3. Hacer clic en **"Guardar"**

##### 1.4.3 Editar Producto
1. Hacer clic en el **icono de lápiz** en la fila del producto
2. Modificar los campos necesarios
3. Hacer clic en **"Actualizar"**

##### 1.4.4 Gestionar Stock
- **Aumentar stock:**
  - Clic en "+" para agregar unidades
  - Ingresar cantidad y justificación
  
- **Disminuir stock:**
  - Clic en "-" para reducir unidades
  - Ingresar cantidad y motivo

- **Ajuste de inventario:**
  - Opción para corregir diferencias
  - Requiere autorización según el rol

##### 1.4.5 Alertas de Inventario
El sistema genera alertas automáticas:
- 🔴 **Stock bajo:** Cuando el stock es igual o menor al mínimo
- ⚠️ **Próximo a vencer:** Productos a 30 días de su vencimiento
- ❌ **Sin stock:** Productos agotados

### 1.5 Gestión de Proveedores

Administra la información de los proveedores de la ferretería.

#### 1.5.1 Ver Proveedores
- **Listado de proveedores** con:
  - Nombre
  - NIT/Identificación
  - Contacto
  - Teléfono
  - Email
  - Dirección
  - Estado (activo/inactivo)
  - Productos suministrados

#### 1.5.2 Agregar Proveedor
1. Hacer clic en **"+ Nuevo Proveedor"**
2. Completar información:
   - Nombre comercial
   - NIT o identificación
   - Persona de contacto
   - Teléfono
   - Email
   - Dirección
   - Ciudad
   - Notas adicionales
3. Guardar

#### 1.5.3 Asociar Productos
- Ver productos del proveedor
- Agregar nuevos productos
- Actualizar precios de compra
- Gestionar catálogo

#### 1.5.4 Historial
- Compras realizadas
- Facturas
- Notas de crédito
- Saldo pendiente

### 1.6 Sistema de Facturación

Genera y gestiona las ventas y facturas del negocio.

#### 1.6.1 Crear Nueva Factura
1. Hacer clic en **"Nueva Factura"**
2. **Seleccionar o crear cliente:**
   - Buscar cliente existente
   - Crear nuevo cliente rápido
3. **Agregar productos:**
   - Buscar producto por nombre o código
   - Escanear código de barras (si está disponible)
   - Ajustar cantidad
   - Aplicar descuentos (si tiene permiso)
4. **Revisar totales:**
   - Subtotal
   - Descuentos
   - IVA
   - Total
5. **Seleccionar método de pago:**
   - Efectivo
   - Tarjeta
   - Transferencia
   - Crédito
6. **Procesar venta:**
   - Confirmar factura
   - Imprimir/Descargar PDF
   - Enviar por correo (opcional)

#### 1.6.2 Gestionar Facturas
- **Ver historial de facturas**
- **Buscar facturas:**
  - Por número
  - Por cliente
  - Por fecha
  - Por monto
- **Acciones:**
  - Ver detalle
  - Reimprimir
  - Anular (con permisos de admin)
  - Aplicar notas crédito

#### 1.6.3 Caja
- **Abrir caja:** Registrar dinero inicial
- **Movimientos de caja:**
  - Ingresos
  - Egresos
  - Notas
- **Cerrar caja:**
  - Conteo final
  - Reporte de cierre
  - Diferencias

### 1.7 Gestión de Clientes

Administra la base de datos de clientes.

#### 1.7.1 Ver Clientes
- **Listado completo** con:
  - Nombre
  - Tipo de documento
  - Número de documento
  - Teléfono
  - Email
  - Dirección
  - Total de compras
  - Última compra

#### 1.7.2 Agregar Cliente
1. Clic en **"+ Nuevo Cliente"**
2. Información requerida:
   - Nombre completo
   - Tipo de documento (CC, NIT, CE, etc.)
   - Número de documento
   - Teléfono
   - Email
   - Dirección
   - Ciudad
3. Guardar

#### 1.7.3 Perfil del Cliente
- **Datos personales**
- **Historial de compras:**
  - Facturas
  - Total gastado
  - Productos más comprados
- **Créditos:**
  - Límite de crédito
  - Saldo actual
  - Pagos pendientes
- **Notas:**
  - Observaciones especiales
  - Preferencias

### 1.8 Reportes

Genera reportes detallados para análisis del negocio.

#### 1.8.1 Tipos de Reportes

##### Reportes de Ventas
- **Ventas diarias:** Resumen por día
- **Ventas mensuales:** Comparativa mensual
- **Ventas por producto:** Productos más vendidos
- **Ventas por categoría:** Categorías más rentables
- **Ventas por cliente:** Mejores clientes

##### Reportes de Inventario
- **Movimientos de inventario:** Entradas y salidas
- **Valorización de inventario:** Valor total del stock
- **Productos sin movimiento:** Items estancados
- **Productos con rotación alta:** Más vendidos
- **Alertas de stock:** Productos críticos

##### Reportes Financieros
- **Utilidad por período:** Ganancia neta
- **Flujo de caja:** Ingresos vs egresos
- **Cuentas por cobrar:** Cartera
- **Cuentas por pagar:** Deudas con proveedores

##### Reportes de Compras
- **Compras por proveedor**
- **Comparativa de precios**
- **Historial de órdenes**

#### 1.8.2 Generar Reportes
1. Seleccionar **tipo de reporte**
2. Configurar **filtros:**
   - Rango de fechas
   - Categorías
   - Proveedores
   - Clientes
3. Hacer clic en **"Generar"**
4. **Visualizar:** Gráficos y tablas
5. **Exportar:**
   - PDF
   - Excel
   - CSV

#### 1.8.3 Gráficos Interactivos
- Gráficos de barras
- Gráficos de líneas
- Gráficos circulares
- Tendencias
- Comparativas

### 1.9 Configuración

Panel de configuración del sistema (solo accesible para Administradores).

#### 1.9.1 Configuración de la Empresa
- **Información básica:**
  - Nombre de la empresa
  - NIT/RUT
  - Dirección
  - Teléfono
  - Email
  - Sitio web
  - Logo

#### 1.9.2 Configuración de Facturación
- **Numeración:**
  - Prefijo de facturas
  - Número inicial
  - Resolución DIAN (Colombia)
- **IVA y impuestos:**
  - Porcentaje de IVA
  - Otros impuestos
- **Métodos de pago:**
  - Activar/desactivar métodos

#### 1.9.3 Gestión de Usuarios
- **Ver usuarios del sistema**
- **Crear nuevo usuario:**
  - Username
  - Nombre completo
  - Email
  - Rol (admin/cajero/bodega)
  - Contraseña inicial
- **Editar usuarios:**
  - Cambiar rol
  - Actualizar información
  - Resetear contraseña
- **Desactivar usuarios**

#### 1.9.4 Categorías de Productos
- **Crear categorías:** Organizar productos
- **Editar categorías:** Modificar nombres
- **Eliminar categorías:** Solo si no tienen productos

#### 1.9.5 Configuración del Sistema
- **Zona horaria**
- **Formato de fecha**
- **Moneda**
- **Idioma**
- **Notificaciones:**
  - Stock bajo
  - Productos vencidos
  - Recordatorios

#### 1.9.6 Backup y Seguridad
- **Respaldo de datos:**
  - Backup automático
  - Descargar backup manual
- **Logs del sistema:**
  - Historial de acciones
  - Auditoría
- **Seguridad:**
  - Cambiar contraseña
  - Sesiones activas
  - Verificación en dos pasos (2FA)

---

## 2. Cómo Funciona

### 2.1 Arquitectura del Sistema

El sistema está construido con una arquitectura moderna de aplicación web:

```
┌─────────────────────────────────────────────┐
│           NAVEGADOR (Cliente)               │
│  ┌───────────────────────────────────────┐  │
│  │         React/Next.js App             │  │
│  │  (Interfaz de Usuario - Frontend)     │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ HTTPS/API Calls
                   ▼
┌─────────────────────────────────────────────┐
│         SERVIDOR (Next.js)                  │
│  ┌───────────────────────────────────────┐  │
│  │       API Routes (Backend)            │  │
│  │  - Autenticación                      │  │
│  │  - Gestión de datos                   │  │
│  │  - Lógica de negocio                  │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │ SQL Queries
                   ▼
┌─────────────────────────────────────────────┐
│        SUPABASE (Base de Datos)             │
│  ┌───────────────────────────────────────┐  │
│  │      PostgreSQL Database              │  │
│  │  - Tablas de datos                    │  │
│  │  - Relaciones                         │  │
│  │  - Procedimientos almacenados         │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │     Authentication Service            │  │
│  │  - Gestión de usuarios                │  │
│  │  - Sesiones                           │  │
│  │  - Seguridad                          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 2.2 Sistema de Autenticación

#### Flujo de Inicio de Sesión:
1. **Usuario ingresa credenciales** → Formulario envía datos
2. **API valida en Supabase** → Verifica username/password
3. **Supabase Auth crea sesión** → Token JWT generado
4. **Sistema obtiene perfil** → Lee tabla `profiles`
5. **Asigna permisos según rol** → Carga interfaz personalizada

#### Gestión de Sesiones:
- **Tokens JWT:** Autenticación segura basada en tokens
- **Refresh automático:** Tokens se renuevan automáticamente
- **Persistencia:** Sesión se mantiene entre recargas
- **Cierre de sesión:** Limpia tokens y redirige a login

#### Seguridad:
- Contraseñas hasheadas (bcrypt)
- Tokens con expiración
- HTTPS obligatorio
- Protección CSRF
- Rate limiting

### 2.3 Roles y Permisos

El sistema implementa un modelo RBAC (Role-Based Access Control):

#### Matriz de Permisos:

| Módulo         | Admin | Cajero | Bodega |
|----------------|-------|--------|--------|
| Dashboard      | ✅    | ❌     | ❌     |
| Inventario     | ✅    | ✅     | ✅     |
| Proveedores    | ✅    | ❌     | ❌     |
| Facturación    | ✅    | ✅     | ❌     |
| Clientes       | ✅    | ✅     | ❌     |
| Reportes       | ✅    | ✅     | ✅     |
| Configuración  | ✅    | ❌     | ❌     |

#### Implementación:
```javascript
// Verificación de permisos en el código
const canAccess = (permission) => {
  return user.permissions.includes(permission);
};

// Renderizado condicional
{canAccess('settings') && <SettingsButton />}
```

### 2.4 Flujo de Datos

#### Ejemplo: Crear una Factura

```
1. Usuario hace clic en "Nueva Factura"
   ↓
2. Frontend carga componente BillingSystem
   ↓
3. Usuario selecciona cliente y productos
   ↓
4. Frontend calcula totales en tiempo real
   ↓
5. Usuario confirma venta
   ↓
6. Frontend envía petición POST a /api/billing
   ↓
7. API valida datos y permisos
   ↓
8. API inicia transacción en Supabase:
   - Crea registro en tabla 'sales'
   - Crea registros en 'sale_items'
   - Actualiza stock en 'products'
   - Registra movimiento en 'inventory_movements'
   ↓
9. Supabase confirma transacción
   ↓
10. API responde con datos de factura
    ↓
11. Frontend actualiza UI y muestra PDF
```

#### Gestión de Estado:
- **Estado local:** React useState para formularios
- **Estado global:** Context API para usuario y configuración
- **Estado del servidor:** React Query/SWR para datos remotos
- **Caché:** Optimización de peticiones repetidas

### 2.5 Base de Datos

#### Estructura Principal:

##### Tabla: `profiles`
```sql
- user_id (UUID, FK a auth.users)
- username (VARCHAR, UNIQUE)
- name (VARCHAR)
- role (ENUM: admin, cajero, bodega)
- created_at (TIMESTAMP)
```

##### Tabla: `products`
```sql
- id (UUID, PK)
- sku (VARCHAR, UNIQUE)
- name (VARCHAR)
- description (TEXT)
- category_id (UUID, FK)
- supplier_id (UUID, FK)
- stock (INTEGER)
- min_stock (INTEGER)
- purchase_price (DECIMAL)
- sale_price (DECIMAL)
- expiry_date (DATE, NULLABLE)
- location (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

##### Tabla: `suppliers`
```sql
- id (UUID, PK)
- name (VARCHAR)
- nit (VARCHAR, UNIQUE)
- contact_person (VARCHAR)
- phone (VARCHAR)
- email (VARCHAR)
- address (TEXT)
- city (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

##### Tabla: `customers`
```sql
- id (UUID, PK)
- name (VARCHAR)
- document_type (VARCHAR)
- document_number (VARCHAR, UNIQUE)
- phone (VARCHAR)
- email (VARCHAR)
- address (TEXT)
- city (VARCHAR)
- credit_limit (DECIMAL)
- current_balance (DECIMAL)
- created_at (TIMESTAMP)
```

##### Tabla: `sales`
```sql
- id (UUID, PK)
- invoice_number (VARCHAR, UNIQUE)
- customer_id (UUID, FK)
- user_id (UUID, FK)
- subtotal (DECIMAL)
- tax (DECIMAL)
- discount (DECIMAL)
- total (DECIMAL)
- payment_method (ENUM)
- status (ENUM: completed, cancelled)
- created_at (TIMESTAMP)
```

##### Tabla: `sale_items`
```sql
- id (UUID, PK)
- sale_id (UUID, FK)
- product_id (UUID, FK)
- quantity (INTEGER)
- unit_price (DECIMAL)
- subtotal (DECIMAL)
- discount (DECIMAL)
- total (DECIMAL)
```

##### Tabla: `inventory_movements`
```sql
- id (UUID, PK)
- product_id (UUID, FK)
- movement_type (ENUM: in, out, adjustment)
- quantity (INTEGER)
- reason (TEXT)
- user_id (UUID, FK)
- reference_id (UUID, NULLABLE)
- created_at (TIMESTAMP)
```

#### Relaciones:
- Un proveedor tiene muchos productos
- Un producto pertenece a una categoría
- Una venta tiene muchos items
- Un item pertenece a un producto
- Un movimiento está asociado a un producto

### 2.6 Gestión de Estado

#### Context API - AuthContext:
```javascript
// Proporciona información de autenticación global
- user: Datos del usuario actual
- login(): Función para iniciar sesión
- logout(): Función para cerrar sesión
- isAuthenticated: Estado booleano
- loading: Estado de carga
```

#### Context API - SystemSettingsContext:
```javascript
// Proporciona configuración del sistema
- settings: Configuraciones globales
- updateSettings(): Actualizar configuración
```

#### Hooks Personalizados:
- **useAuth():** Acceso a contexto de autenticación
- **usePermissions():** Verificación de permisos
- **useSystemSettings():** Acceso a configuración

---

## 3. Tecnologías Utilizadas y Detalles Extra

### 3.1 Stack Tecnológico

#### Frontend Framework
- **Next.js 15.5.4**
  - Framework React con renderizado híbrido
  - App Router (nueva arquitectura)
  - Server Components
  - Optimizaciones automáticas
  - File-based routing

#### Lenguaje
- **TypeScript 5.9.2**
  - Tipado estático
  - Mejor autocompletado
  - Detección de errores en desarrollo
  - Mejor mantenibilidad del código

#### Librería de UI
- **React 18.3.1**
  - Componentes funcionales
  - Hooks modernos
  - Concurrent rendering
  - Automatic batching

### 3.2 Librerías y Dependencias

#### UI Components (Radix UI)
Sistema de componentes accesibles y sin estilos predefinidos:
- `@radix-ui/react-dialog` - Modales
- `@radix-ui/react-dropdown-menu` - Menús desplegables
- `@radix-ui/react-select` - Selectores
- `@radix-ui/react-tabs` - Pestañas
- `@radix-ui/react-tooltip` - Tooltips
- `@radix-ui/react-popover` - Popovers
- Y más componentes...

#### Estilos
- **Tailwind CSS 4.x**
  - Utility-first CSS
  - Diseño responsive
  - Dark mode ready
  - Customización completa
- **tailwindcss-animate**
  - Animaciones predefinidas
- **class-variance-authority**
  - Variantes de componentes
- **clsx** & **tailwind-merge**
  - Gestión de clases CSS

#### Backend & Base de Datos
- **Supabase 2.57.4**
  - PostgreSQL como base de datos
  - Authentication integrada
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage para archivos
- **@supabase/ssr 0.7.0**
  - Server-side rendering support
- **@supabase/auth-helpers-nextjs 0.10.0**
  - Helpers para Next.js

#### Visualización de Datos
- **Recharts 2.15.2**
  - Gráficos en React
  - Altamente customizable
  - Responsive
  - Tipos: líneas, barras, circular, área

#### Formularios
- **React Hook Form 7.55.0**
  - Validación de formularios
  - Performance optimizado
  - Menos re-renders
  - Fácil integración

#### Generación de PDFs
- **jsPDF 3.0.3**
  - Generación de facturas
  - Reportes en PDF
  - Customizable

#### UI/UX Adicionales
- **Lucide React 0.487.0**
  - Librería de iconos moderna
  - 1000+ iconos
  - Tree-shakeable
- **Sonner 2.0.7**
  - Sistema de notificaciones toast
  - Animaciones suaves
- **cmdk 1.1.1**
  - Command palette
  - Búsqueda rápida
- **Embla Carousel 8.6.0**
  - Carruseles
- **Next Themes 0.4.6**
  - Dark/Light mode

#### Utilities
- **date-fns** (implícito en date-utils.ts)
  - Manipulación de fechas
  - Formato colombiano

### 3.3 Estructura del Proyecto

```
ferreteria-pro/
│
├── public/                      # Archivos estáticos
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots
│
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página principal
│   │   ├── sitemap.ts          # Sitemap automático
│   │   ├── opengraph-image.tsx # OG image dinámico
│   │   ├── icon.tsx            # Favicon dinámico
│   │   └── api/                # API Routes
│   │       ├── admin/          # Rutas de admin
│   │       ├── suppliers/      # Gestión de proveedores
│   │       ├── create-user/    # Crear usuarios
│   │       └── ...
│   │
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes UI base
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── auth-context.tsx    # Context de autenticación
│   │   ├── inventory-dashboard.tsx
│   │   ├── billing-system.tsx
│   │   └── ...
│   │
│   ├── lib/                    # Utilidades y configuración
│   │   ├── supabase-client.ts  # Cliente Supabase (browser)
│   │   ├── supabase-server.ts  # Cliente Supabase (server)
│   │   ├── date-utils.ts       # Utilidades de fecha
│   │   └── supabase.ts         # Tipos y configs
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── use-is-mobile.ts    # Detectar móvil
│   │   └── useSystemSettings.ts
│   │
│   ├── guidelines/             # Documentación
│   │   └── Guidelines.md
│   │
│   ├── globals.css             # Estilos globales
│   ├── index.css               # Estilos base
│   └── middleware.ts           # Middleware de Next.js
│
├── next.config.mjs             # Configuración Next.js
├── tsconfig.json               # Configuración TypeScript
├── package.json                # Dependencias
├── tailwind.config.js          # Configuración Tailwind
├── postcss.config.js           # Configuración PostCSS
└── README.md                   # Documentación
```

### 3.4 Características Especiales

#### PWA (Progressive Web App)
- **Instalable:** Se puede instalar como app nativa
- **Offline-capable:** Funciona sin conexión (cache)
- **Responsive:** Se adapta a cualquier dispositivo
- **Manifest.json:** Configuración de PWA

#### SEO Optimizado
- **Sitemap automático:** Generado dinámicamente
- **Robots.txt:** Configurado para crawlers
- **Open Graph:** Meta tags para redes sociales
- **Favicon dinámico:** Generado con React

#### Internacionalización
- **Formato de fecha colombiano:**
  ```javascript
  formatColombiaDate() // "Lun, 20 Oct 2025"
  ```
- **Zona horaria América/Bogotá**
- **Moneda en pesos colombianos (COP)**

#### Real-time Updates
- **Supabase Realtime:**
  - Actualizaciones en tiempo real
  - Múltiples usuarios simultáneos
  - Sincronización automática

#### Diseño Responsive
- **Mobile-first:** Diseñado primero para móvil
- **Breakpoints Tailwind:**
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

#### Dark Mode
- **Sistema de temas:**
  - Light mode
  - Dark mode
  - Auto (según sistema operativo)
- **Persistencia:** Preferencia guardada

#### Accesibilidad (a11y)
- **Radix UI:** Componentes accesibles por defecto
- **ARIA labels:** Etiquetas para lectores de pantalla
- **Navegación por teclado:** Soporte completo
- **Contraste de colores:** WCAG AA compliant

### 3.5 Seguridad

#### Autenticación
- **JWT Tokens:** Tokens seguros con firma
- **HttpOnly Cookies:** Protección contra XSS
- **Refresh Tokens:** Renovación automática
- **Session Management:** Control de sesiones

#### Autorización
- **Row Level Security (RLS):** Políticas a nivel de fila en Supabase
- **Role-Based Access Control (RBAC):** Permisos por rol
- **API Route Protection:** Middleware de verificación

#### Protección de Datos
- **Encriptación en tránsito:** HTTPS/TLS
- **Encriptación en reposo:** Datos encriptados en BD
- **Variables de entorno:** Credenciales protegidas
- **CORS configurado:** Orígenes permitidos

#### Validación
- **Input validation:** Validación en frontend y backend
- **SQL Injection protection:** Queries parametrizadas
- **XSS prevention:** Sanitización de inputs
- **CSRF tokens:** Protección contra CSRF

### 3.6 Rendimiento

#### Optimizaciones de Next.js
- **Server Components:** Menos JavaScript al cliente
- **Automatic Code Splitting:** Carga solo lo necesario
- **Image Optimization:** Next/Image optimizado
- **Font Optimization:** Google Fonts optimizado
- **Static Generation:** Páginas estáticas donde sea posible

#### Optimizaciones de React
- **React.memo:** Evita re-renders innecesarios
- **useMemo/useCallback:** Memoización de valores y funciones
- **Lazy Loading:** Carga diferida de componentes
- **Suspense:** Carga progresiva

#### Optimizaciones de Base de Datos
- **Indexes:** Índices en columnas frecuentes
- **Query Optimization:** Queries optimizadas
- **Connection Pooling:** Pool de conexiones
- **Caching:** Cache de queries frecuentes

#### Métricas de Rendimiento
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Lighthouse Score:** Objetivo 90+
- **Bundle Size:** Optimizado y tree-shaken

---

## 📝 Notas Adicionales

### Requisitos del Sistema
- **Navegadores soportados:**
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+
  - Opera 76+
- **Conexión a internet:** Requerida
- **JavaScript:** Habilitado obligatorio

### Instalación Local (Para Desarrolladores)
```bash
# Clonar repositorio
git clone [repository-url]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Soporte y Ayuda
Para soporte técnico o reportar problemas:
1. Revisar este manual
2. Consultar la documentación técnica
3. Contactar al administrador del sistema
4. Revisar logs del sistema (para admins)

### Actualizaciones
El sistema se actualiza regularmente con:
- Nuevas funcionalidades
- Mejoras de seguridad
- Corrección de bugs
- Optimizaciones de rendimiento

---

## 🎯 Conclusión

Este manual cubre todos los aspectos del sistema de gestión para ferretería, desde el uso básico hasta los detalles técnicos de implementación. El sistema está diseñado para ser:

✅ **Fácil de usar:** Interfaz intuitiva y amigable
✅ **Seguro:** Múltiples capas de seguridad
✅ **Escalable:** Crece con tu negocio
✅ **Rápido:** Optimizado para rendimiento
✅ **Moderno:** Tecnologías de última generación
✅ **Mantenible:** Código limpio y documentado

Para cualquier duda o sugerencia, no dudes en contactar al equipo de desarrollo.

---

**Versión del Manual:** 1.0
**Última Actualización:** Octubre 2025
**Sistema:** Ferretería Pro - Sistema de Gestión Integral
