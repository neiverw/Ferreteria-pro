# 🗄️ Base de Datos - Sistema Ferretería Pro

## 📋 Descripción General

Base de datos completa para el sistema de gestión de ferretería que incluye:
- ✅ Gestión de usuarios y autenticación
- 📦 Control de inventario y productos
- 🧾 Sistema de facturación
- 👥 Gestión de clientes
- 📊 Reportes de stock
- 📈 Análisis de ventas

## 🏗️ Estructura de la Base de Datos

### 📊 Diagrama Entidad-Relación

![Diagrama de Base de Datos](https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhYmFzZSUyMGRpYWdyYW0lMjBzY2hlbWF8ZW58MXx8fHwxNzU3OTQzOTg3fDA&ixlib=rb-4.1.0&q=80&w=1080)

### 🔗 Relaciones Principales

```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string name
        string email
        string password_hash
        enum role
        json permissions
        boolean is_active
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORIES {
        int id PK
        string name
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    SUPPLIERS {
        int id PK
        string name
        string contact_name
        string phone
        string email
        text address
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        int id PK
        string code
        string name
        text description
        int category_id FK
        int supplier_id FK
        string brand
        int stock
        int min_stock
        decimal price
        decimal cost
        string location
        string barcode
        string image_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    CUSTOMERS {
        int id PK
        string name
        string document
        enum document_type
        string phone
        string email
        text address
        string city
        string department
        date registration_date
        boolean is_active
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    INVOICES {
        int id PK
        string invoice_number
        int customer_id FK
        int user_id FK
        date invoice_date
        date due_date
        decimal subtotal
        decimal tax_rate
        decimal tax_amount
        decimal discount
        decimal total
        enum status
        enum payment_method
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    INVOICE_ITEMS {
        int id PK
        int invoice_id FK
        int product_id FK
        string product_name
        string product_code
        decimal quantity
        decimal unit_price
        decimal discount
        decimal total
        timestamp created_at
    }
    
    STOCK_REPORTS {
        int id PK
        string report_number
        int product_id FK
        int reported_by FK
        date report_date
        time report_time
        int current_stock
        int reported_stock
        int difference
        enum priority
        enum status
        text notes
        string location
        int resolved_by FK
        timestamp resolved_at
        timestamp created_at
        timestamp updated_at
    }
    
    STOCK_MOVEMENTS {
        int id PK
        int product_id FK
        enum movement_type
        int quantity
        int previous_stock
        int new_stock
        enum reference_type
        int reference_id
        int user_id FK
        text notes
        timestamp movement_date
    }
    
    SYSTEM_SETTINGS {
        int id PK
        string setting_key
        text setting_value
        text description
        enum data_type
        boolean is_editable
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    SUPPLIERS ||--o{ PRODUCTS : "supplies"
    USERS ||--o{ INVOICES : "creates"
    CUSTOMERS ||--o{ INVOICES : "purchases"
    INVOICES ||--o{ INVOICE_ITEMS : "contains"
    PRODUCTS ||--o{ INVOICE_ITEMS : "sold_in"
    PRODUCTS ||--o{ STOCK_REPORTS : "reported_for"
    USERS ||--o{ STOCK_REPORTS : "reports"
    USERS ||--o{ STOCK_REPORTS : "resolves"
    PRODUCTS ||--o{ STOCK_MOVEMENTS : "affects"
    USERS ||--o{ STOCK_MOVEMENTS : "executes"
```

## 📁 Archivos Incluidos

### 1. `ferreteria_schema.sql`
- 🗃️ **Esquema completo de la base de datos**
- 📊 Creación de todas las tablas
- 🔗 Relaciones y foreign keys
- 📈 Índices para optimización
- 🔧 Triggers automáticos
- 📝 Datos iniciales

### 2. `supabase_setup.sql`
- ☁️ **Configuración específica para Supabase**
- 🔐 Políticas de Row Level Security (RLS)
- ⚡ Funciones en tiempo real
- 🔧 Triggers optimizados para PostgreSQL
- 🚀 API functions

### 3. `useful_queries.sql`
- 📊 **Consultas predefinidas para el sistema**
- 📈 Queries para dashboard
- 📦 Análisis de inventario
- 💰 Reportes de ventas
- 👥 Gestión de clientes
- 🔍 Análisis de negocio

### 4. `database_documentation.md`
- 📚 **Documentación completa**
- 🎯 Descripción de cada tabla
- 🔗 Explicación de relaciones
- 💡 Características especiales
- 🚀 Guías de escalabilidad

## 🛠️ Instalación

### Opción 1: MySQL/MariaDB Local
```bash
# 1. Crear la base de datos
mysql -u root -p < ferreteria_schema.sql

# 2. Ejecutar consultas de prueba
mysql -u root -p ferreteria_pro < useful_queries.sql
```

### Opción 2: Supabase (Recomendado)
```bash
# 1. Crear proyecto en Supabase
# 2. Ejecutar el esquema base
psql -h your-project.supabase.co -U postgres -d postgres -f ferreteria_schema.sql

# 3. Configurar políticas de seguridad
psql -h your-project.supabase.co -U postgres -d postgres -f supabase_setup.sql
```

## 🔧 Configuración del Frontend

### Variables de Entorno
```env
# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/ferreteria_pro"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Conexión con React
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 📊 Características Principales

### 🔄 Triggers Automáticos
- ✅ **Actualización de Stock**: Reducción automática al vender
- 💰 **Cálculo de Totales**: Totales de factura automáticos
- 📝 **Registro de Movimientos**: Historial completo de cambios

### 🚀 Optimizaciones
- 📈 **Índices Estratégicos**: Búsquedas rápidas
- 👁️ **Vistas Predefinidas**: Consultas complejas simplificadas
- 🔍 **Procedimientos Almacenados**: Lógica de negocio centralizada

### 🔐 Seguridad
- 🛡️ **Row Level Security**: Control granular de acceso
- 👤 **Autenticación**: Sistema de usuarios robusto
- 📋 **Auditoría**: Registro completo de actividades

### 📱 Tiempo Real
- ⚡ **Actualizaciones en Vivo**: Stock y ventas en tiempo real
- 🔔 **Notificaciones**: Alertas de stock bajo
- 📊 **Dashboard Dinámico**: Métricas actualizadas

## 📈 Casos de Uso

### Dashboard Principal
```sql
-- Métricas del día
SELECT 
    COUNT(*) as ventas_hoy,
    SUM(total) as ingresos_hoy,
    (SELECT COUNT(*) FROM products WHERE stock <= min_stock) as productos_criticos
FROM invoices 
WHERE DATE(invoice_date) = CURDATE() AND status = 'paid';
```

### Control de Inventario
```sql
-- Productos con stock bajo
SELECT p.name, p.stock, p.min_stock, p.location
FROM products p 
WHERE p.stock <= p.min_stock AND p.is_active = TRUE
ORDER BY p.stock ASC;
```

### Análisis de Ventas
```sql
-- Top productos del mes
SELECT p.name, SUM(ii.quantity) as vendidos, SUM(ii.total) as ingresos
FROM products p
JOIN invoice_items ii ON p.id = ii.product_id
JOIN invoices i ON ii.invoice_id = i.id
WHERE MONTH(i.invoice_date) = MONTH(CURDATE())
GROUP BY p.id, p.name
ORDER BY vendidos DESC
LIMIT 10;
```

## 🚀 Próximos Pasos

1. **Implementar conexión con Supabase** en el frontend
2. **Configurar realtime subscriptions** para actualizaciones en vivo
3. **Agregar sistema de backups** automáticos
4. **Implementar analytics avanzados** con métricas de negocio
5. **Configurar alertas** por email/SMS para stock crítico

## 📞 Soporte

Para dudas sobre la implementación:
- 📧 Consultar la documentación detallada
- 🔍 Revisar las consultas de ejemplo
- 🛠️ Verificar la configuración de triggers y políticas

---

**🎯 Base de datos diseñada específicamente para las necesidades del Sistema Ferretería Pro**