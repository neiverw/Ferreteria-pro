# Base de Datos - Sistema Ferretería Pro

## Diagrama de Base de Datos

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│     CATEGORIES      │     │     SUPPLIERS       │     │       USERS         │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ id (PK)            │     │ id (PK)            │     │ id (PK)            │
│ name               │     │ name               │     │ username           │
│ description        │     │ contact_name       │     │ name               │
│ created_at         │     │ phone              │     │ email              │
│ updated_at         │     │ email              │     │ password_hash      │
└─────────────────────┘     │ address            │     │ role               │
                            │ created_at         │     │ permissions        │
                            │ updated_at         │     │ is_active          │
                            └─────────────────────┘     │ last_login         │
                                                        │ created_at         │
                                                        │ updated_at         │
                                                        └─────────────────────┘
                                    │                           │
                                    │                           │
                                    │                           │
┌─────────────────────┐            │                           │
│     PRODUCTS        │◄───────────┼───────────────────────────┼──────────────┐
├─────────────────────┤            │                           │              │
│ id (PK)            │            │                           │              │
│ code               │            │                           │              │
│ name               │            │                           │              │
│ description        │            │                           │              │
│ category_id (FK)   │────────────┘                           │              │
│ supplier_id (FK)   │                                        │              │
│ brand              │                                        │              │
│ stock              │                                        │              │
│ min_stock          │                                        │              │
│ price              │                                        │              │
│ cost               │                                        │              │
│ location           │                                        │              │
│ barcode            │                                        │              │
│ image_url          │                                        │              │
│ is_active          │                                        │              │
│ created_at         │                                        │              │
│ updated_at         │                                        │              │
└─────────────────────┘                                        │              │
        │                                                      │              │
        │                                                      │              │
        │                ┌─────────────────────┐              │              │
        │                │    CUSTOMERS        │              │              │
        │                ├─────────────────────┤              │              │
        │                │ id (PK)            │              │              │
        │                │ name               │              │              │
        │                │ document           │              │              │
        │                │ document_type      │              │              │
        │                │ phone              │              │              │
        │                │ email              │              │              │
        │                │ address            │              │              │
        │                │ city               │              │              │
        │                │ department         │              │              │
        │                │ registration_date  │              │              │
        │                │ is_active          │              │              │
        │                │ notes              │              │              │
        │                │ created_at         │              │              │
        │                │ updated_at         │              │              │
        │                └─────────────────────┘              │              │
        │                        │                            │              │
        │                        │                            │              │
        │                        │                            │              │
        │                ┌─────────────────────┐              │              │
        │                │     INVOICES        │◄─────────────┘              │
        │                ├─────────────────────┤                             │
        │                │ id (PK)            │                             │
        │                │ invoice_number     │                             │
        │                │ customer_id (FK)   │─────────────────────────────┘
        │                │ user_id (FK)       │
        │                │ invoice_date       │
        │                │ due_date           │
        │                │ subtotal           │
        │                │ tax_rate           │
        │                │ tax_amount         │
        │                │ discount           │
        │                │ total              │
        │                │ status             │
        │                │ payment_method     │
        │                │ notes              │
        │                │ created_at         │
        │                │ updated_at         │
        │                └─────────────────────┘
        │                        │
        │                        │
        │                        │
        │                ┌─────────────────────┐
        │                │  INVOICE_ITEMS      │
        │                ├─────────────────────┤
        │                │ id (PK)            │
        │                │ invoice_id (FK)    │──────────────────────────────┘
        │                │ product_id (FK)    │
        │                │ product_name       │
        │                │ product_code       │
        │                │ quantity           │
        │                │ unit_price         │
        │                │ discount           │
        │                │ total              │
        │                │ created_at         │
        │                └─────────────────────┘
        │                        │
        │                        │
        └────────────────────────┘
        │
        │
        │
┌─────────────────────┐
│   STOCK_REPORTS     │
├─────────────────────┤
│ id (PK)            │
│ report_number      │
│ product_id (FK)    │──────────────────────────────┘
│ reported_by (FK)   │────────────────────┐
│ report_date        │                    │
│ report_time        │                    │
│ current_stock      │                    │
│ reported_stock     │                    │
│ difference         │                    │
│ priority           │                    │
│ status             │                    │
│ notes              │                    │
│ location           │                    │
│ resolved_by (FK)   │────────────────────┼──────────────────────┐
│ resolved_at        │                    │                      │
│ created_at         │                    │                      │
│ updated_at         │                    │                      │
└─────────────────────┘                    │                      │
                                           │                      │
                                           └──────────────────────┼──────────────┐
                                                                  │              │
┌─────────────────────┐                                          │              │
│ STOCK_MOVEMENTS     │                                          │              │
├─────────────────────┤                                          │              │
│ id (PK)            │                                          │              │
│ product_id (FK)    │──────────────────────────────────────────┘              │
│ movement_type      │                                                         │
│ quantity           │                                                         │
│ previous_stock     │                                                         │
│ new_stock          │                                                         │
│ reference_type     │                                                         │
│ reference_id       │                                                         │
│ user_id (FK)       │─────────────────────────────────────────────────────────┘
│ notes              │
│ movement_date      │
└─────────────────────┘

┌─────────────────────┐
│ SYSTEM_SETTINGS     │
├─────────────────────┤
│ id (PK)            │
│ setting_key        │
│ setting_value      │
│ description        │
│ data_type          │
│ is_editable        │
│ created_at         │
│ updated_at         │
└─────────────────────┘
```

## Descripción de Tablas

### 1. **users** - Usuarios del Sistema

- Almacena información de empleados y administradores
- Roles: 'admin' (administrador), 'cajero' (cajero) y 'bodega' (bodega)
- Permisos definidos en JSON para flexibilidad

### 2. **categories** - Categorías de Productos

- Clasificación de productos por tipo
- Ejemplos: Herramientas, Pinturas, Electricidad, etc.

### 3. **suppliers** - Proveedores

- Información de contacto de proveedores
- Relación con productos para control de inventario

### 4. **products** - Productos/Inventario

- Información completa de productos
- Control de stock actual y mínimo
- Precios de venta y costo
- Ubicación física en la tienda

### 5. **customers** - Clientes

- Base de datos de clientes
- Información de contacto y documentos
- Histórico de registro

### 6. **invoices** - Facturas

- Cabecera de facturas de venta
- Cálculos automáticos de impuestos
- Estados de pago

### 7. **invoice_items** - Items de Factura

- Detalle de productos vendidos
- Cantidades y precios unitarios
- Totales por línea

### 8. **stock_reports** - Reportes de Stock

- Reportes de productos agotados o con stock bajo
- Sistema de prioridades
- Seguimiento de resolución

### 9. **stock_movements** - Movimientos de Inventario

- Histórico de todos los movimientos de stock
- Trazabilidad completa de entradas y salidas
- Referencias a facturas, compras, ajustes

### 10. **system_settings** - Configuraciones

- Configuraciones generales del sistema
- Parámetros como tasas de impuestos, prefijos, etc.

## Relaciones Principales

1. **Productos ← Categorías**: Un producto pertenece a una categoría
2. **Productos ← Proveedores**: Un producto tiene un proveedor
3. **Facturas ← Clientes**: Una factura pertenece a un cliente
4. **Facturas ← Usuarios**: Una factura es creada por un usuario
5. **Items Factura ← Facturas**: Items pertenecen a una factura
6. **Items Factura ← Productos**: Items referencian productos
7. **Reportes Stock ← Productos**: Reportes son sobre productos específicos
8. **Reportes Stock ← Usuarios**: Reportes son creados por usuarios
9. **Movimientos Stock ← Productos**: Movimientos afectan productos
10. **Movimientos Stock ← Usuarios**: Movimientos son ejecutados por usuarios

## Características Especiales

### Triggers Automáticos

- **Actualización de Stock**: Al crear items de factura, el stock se reduce automáticamente
- **Cálculo de Totales**: Los totales de factura se calculan automáticamente
- **Registro de Movimientos**: Se registran automáticamente los movimientos de stock

### Procedimientos Almacenados

- **Generación de Números**: Números automáticos para facturas y reportes
- **Cálculos Complejos**: Procedimientos para análisis de ventas

### Vistas Predefinidas

- **Productos con Stock Bajo**: Vista automática de productos que requieren reposición
- **Resumen de Ventas**: Estadísticas de ventas por producto
- **Reportes Pendientes**: Reportes de stock organizados por prioridad

### Índices Optimizados

- Índices en campos de búsqueda frecuente
- Optimización para consultas de reportes
- Mejora en rendimiento de facturación

## Seguridad y Auditoría

- **Timestamps**: Todas las tablas tienen fechas de creación y actualización
- **Soft Deletes**: Productos y clientes se marcan como inactivos en lugar de eliminarse
- **Trazabilidad**: Todos los movimientos de stock quedan registrados
- **Referencias Seguras**: Foreign keys con restricciones apropiadas

## Escalabilidad

- **Particionado**: Tablas preparadas para particionado por fechas
- **Archivado**: Estructura permite archivar datos antiguos
- **Réplicas**: Diseño compatible con replicación maestro-esclavo
- **Cache**: Vistas optimizadas para sistemas de cache