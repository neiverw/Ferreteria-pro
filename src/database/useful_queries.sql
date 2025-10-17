-- =============================================
-- CONSULTAS ÚTILES - SISTEMA FERRETERÍA PRO
-- =============================================

-- =============================================
-- CONSULTAS PARA DASHBOARD
-- =============================================

-- Total de productos, ventas del día, productos con stock bajo
SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as total_productos,
    (SELECT COUNT(*) FROM invoices WHERE DATE(invoice_date) = CURDATE()) as ventas_hoy,
    (SELECT COUNT(*) FROM products WHERE stock <= min_stock AND is_active = TRUE) as productos_stock_bajo,
    (SELECT SUM(total) FROM invoices WHERE DATE(invoice_date) = CURDATE() AND status = 'paid') as ingresos_hoy;

-- Top 5 productos más vendidos del mes
SELECT 
    p.name as producto,
    SUM(ii.quantity) as cantidad_vendida,
    SUM(ii.total) as ingresos_generados
FROM invoice_items ii
JOIN products p ON ii.product_id = p.id
JOIN invoices i ON ii.invoice_id = i.id
WHERE MONTH(i.invoice_date) = MONTH(CURDATE()) 
  AND YEAR(i.invoice_date) = YEAR(CURDATE())
  AND i.status = 'paid'
GROUP BY p.id, p.name
ORDER BY cantidad_vendida DESC
LIMIT 5;

-- Ventas por día de la semana actual
SELECT 
    DATE(invoice_date) as fecha,
    COUNT(*) as num_facturas,
    SUM(total) as total_ventas
FROM invoices 
WHERE WEEK(invoice_date) = WEEK(CURDATE()) 
  AND YEAR(invoice_date) = YEAR(CURDATE())
  AND status = 'paid'
GROUP BY DATE(invoice_date)
ORDER BY fecha;

-- =============================================
-- CONSULTAS PARA INVENTARIO
-- =============================================

-- Productos con stock crítico (agotados y por debajo del mínimo)
SELECT 
    p.code,
    p.name,
    p.stock,
    p.min_stock,
    p.location,
    c.name as categoria,
    s.name as proveedor,
    CASE 
        WHEN p.stock = 0 THEN 'AGOTADO'
        WHEN p.stock <= p.min_stock THEN 'STOCK BAJO'
        ELSE 'NORMAL'
    END as estado_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.stock <= p.min_stock AND p.is_active = TRUE
ORDER BY p.stock ASC, p.min_stock DESC;

-- Valor total del inventario
SELECT 
    COUNT(*) as total_productos,
    SUM(stock) as unidades_totales,
    SUM(stock * cost) as valor_costo,
    SUM(stock * price) as valor_venta,
    SUM(stock * price) - SUM(stock * cost) as ganancia_potencial
FROM products 
WHERE is_active = TRUE;

-- Inventario por categoría
SELECT 
    c.name as categoria,
    COUNT(p.id) as num_productos,
    SUM(p.stock) as unidades_total,
    SUM(p.stock * p.price) as valor_inventario
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
GROUP BY c.id, c.name
ORDER BY valor_inventario DESC;

-- Productos sin movimiento en los últimos 30 días
SELECT 
    p.code,
    p.name,
    p.stock,
    p.price,
    (SELECT MAX(movement_date) FROM stock_movements WHERE product_id = p.id) as ultimo_movimiento
FROM products p
WHERE p.is_active = TRUE
  AND p.id NOT IN (
      SELECT DISTINCT sm.product_id 
      FROM stock_movements sm 
      WHERE sm.movement_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  )
ORDER BY ultimo_movimiento DESC;

-- =============================================
-- CONSULTAS PARA FACTURACIÓN
-- =============================================

-- Facturas del día con totales
SELECT 
    i.invoice_number,
    c.name as cliente,
    u.name as vendedor,
    i.total,
    i.status,
    TIME(i.created_at) as hora_creacion
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
JOIN users u ON i.user_id = u.id
WHERE DATE(i.invoice_date) = CURDATE()
ORDER BY i.created_at DESC;

-- Detalle de una factura específica
SELECT 
    ii.product_name,
    ii.quantity,
    ii.unit_price,
    ii.total
FROM invoice_items ii
WHERE ii.invoice_id = ? -- Parámetro: ID de la factura
ORDER BY ii.id;

-- Resumen de ventas por vendedor del mes
SELECT 
    u.name as vendedor,
    COUNT(i.id) as num_facturas,
    SUM(i.total) as total_ventas,
    AVG(i.total) as promedio_por_factura
FROM users u
JOIN invoices i ON u.id = i.user_id
WHERE MONTH(i.invoice_date) = MONTH(CURDATE()) 
  AND YEAR(i.invoice_date) = YEAR(CURDATE())
  AND i.status = 'paid'
GROUP BY u.id, u.name
ORDER BY total_ventas DESC;

-- Facturas pendientes de pago
SELECT 
    i.invoice_number,
    c.name as cliente,
    c.phone,
    i.invoice_date,
    i.due_date,
    i.total,
    DATEDIFF(CURDATE(), i.due_date) as dias_vencido
FROM invoices i
LEFT JOIN customers c ON i.customer_id = c.id
WHERE i.status IN ('pending', 'overdue')
ORDER BY i.due_date ASC;

-- =============================================
-- CONSULTAS PARA CLIENTES
-- =============================================

-- Top 10 clientes por compras
SELECT 
    c.name,
    c.document,
    c.phone,
    COUNT(i.id) as num_compras,
    SUM(i.total) as total_gastado,
    AVG(i.total) as promedio_por_compra,
    MAX(i.invoice_date) as ultima_compra
FROM customers c
JOIN invoices i ON c.id = i.customer_id
WHERE i.status = 'paid'
GROUP BY c.id, c.name, c.document, c.phone
ORDER BY total_gastado DESC
LIMIT 10;

-- Clientes nuevos del mes
SELECT 
    name,
    document,
    phone,
    email,
    registration_date
FROM customers 
WHERE MONTH(registration_date) = MONTH(CURDATE()) 
  AND YEAR(registration_date) = YEAR(CURDATE())
ORDER BY registration_date DESC;

-- Clientes sin compras en los últimos 90 días
SELECT 
    c.name,
    c.phone,
    c.email,
    (SELECT MAX(i.invoice_date) FROM invoices i WHERE i.customer_id = c.id) as ultima_compra
FROM customers c
WHERE c.is_active = TRUE
  AND (
      SELECT MAX(i.invoice_date) 
      FROM invoices i 
      WHERE i.customer_id = c.id
  ) < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
  OR NOT EXISTS (
      SELECT 1 FROM invoices i WHERE i.customer_id = c.id
  )
ORDER BY ultima_compra DESC;

-- =============================================
-- CONSULTAS PARA REPORTES DE STOCK
-- =============================================

-- Reportes pendientes por prioridad
SELECT 
    sr.priority,
    COUNT(*) as cantidad,
    GROUP_CONCAT(p.name ORDER BY sr.created_at SEPARATOR ', ') as productos
FROM stock_reports sr
JOIN products p ON sr.product_id = p.id
WHERE sr.status = 'pending'
GROUP BY sr.priority
ORDER BY FIELD(sr.priority, 'critical', 'high', 'medium', 'low');

-- Historial de reportes por empleado
SELECT 
    u.name as empleado,
    COUNT(sr.id) as total_reportes,
    SUM(CASE WHEN sr.status = 'resolved' THEN 1 ELSE 0 END) as resueltos,
    SUM(CASE WHEN sr.priority = 'critical' THEN 1 ELSE 0 END) as criticos
FROM users u
JOIN stock_reports sr ON u.id = sr.reported_by
WHERE sr.report_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY u.id, u.name
ORDER BY total_reportes DESC;

-- Productos más reportados
SELECT 
    p.name as producto,
    p.location,
    COUNT(sr.id) as num_reportes,
    MAX(sr.report_date) as ultimo_reporte
FROM products p
JOIN stock_reports sr ON p.id = sr.product_id
WHERE sr.report_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
GROUP BY p.id, p.name, p.location
HAVING num_reportes > 1
ORDER BY num_reportes DESC;

-- =============================================
-- CONSULTAS PARA ANÁLISIS DE NEGOCIO
-- =============================================

-- Análisis de rentabilidad por producto
SELECT 
    p.name,
    p.price as precio_venta,
    p.cost as precio_costo,
    (p.price - p.cost) as margen_unitario,
    ROUND(((p.price - p.cost) / p.price) * 100, 2) as margen_porcentaje,
    COALESCE(SUM(ii.quantity), 0) as vendidos_mes,
    COALESCE(SUM(ii.total), 0) as ingresos_mes,
    COALESCE(SUM(ii.quantity * p.cost), 0) as costo_mes,
    COALESCE(SUM(ii.total) - SUM(ii.quantity * p.cost), 0) as ganancia_mes
FROM products p
LEFT JOIN invoice_items ii ON p.id = ii.product_id
LEFT JOIN invoices i ON ii.invoice_id = i.id AND MONTH(i.invoice_date) = MONTH(CURDATE()) AND i.status = 'paid'
WHERE p.is_active = TRUE
GROUP BY p.id, p.name, p.price, p.cost
ORDER BY ganancia_mes DESC;

-- Comparativo de ventas mes actual vs mes anterior
SELECT 
    'Mes Actual' as periodo,
    COUNT(*) as num_facturas,
    SUM(total) as total_ventas,
    AVG(total) as promedio_factura
FROM invoices 
WHERE MONTH(invoice_date) = MONTH(CURDATE()) 
  AND YEAR(invoice_date) = YEAR(CURDATE())
  AND status = 'paid'

UNION ALL

SELECT 
    'Mes Anterior' as periodo,
    COUNT(*) as num_facturas,
    SUM(total) as total_ventas,
    AVG(total) as promedio_factura
FROM invoices 
WHERE MONTH(invoice_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  AND YEAR(invoice_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  AND status = 'paid';

-- Análisis de frecuencia de compra por cliente
SELECT 
    c.name,
    COUNT(i.id) as total_compras,
    DATEDIFF(MAX(i.invoice_date), MIN(i.invoice_date)) as dias_como_cliente,
    ROUND(COUNT(i.id) / GREATEST(DATEDIFF(MAX(i.invoice_date), MIN(i.invoice_date)), 1) * 30, 2) as compras_por_mes,
    SUM(i.total) as total_gastado
FROM customers c
JOIN invoices i ON c.id = i.customer_id
WHERE i.status = 'paid'
GROUP BY c.id, c.name
HAVING total_compras > 1
ORDER BY compras_por_mes DESC;

-- =============================================
-- CONSULTAS PARA MANTENIMIENTO
-- =============================================

-- Limpieza de datos: Clientes duplicados potenciales
SELECT 
    document,
    COUNT(*) as duplicados,
    GROUP_CONCAT(name SEPARATOR ' | ') as nombres
FROM customers 
WHERE document IS NOT NULL AND document != ''
GROUP BY document
HAVING COUNT(*) > 1;

-- Productos sin categoría o proveedor
SELECT 
    p.code,
    p.name,
    CASE WHEN p.category_id IS NULL THEN 'Sin Categoría' ELSE c.name END as categoria,
    CASE WHEN p.supplier_id IS NULL THEN 'Sin Proveedor' ELSE s.name END as proveedor
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.category_id IS NULL OR p.supplier_id IS NULL
ORDER BY p.name;

-- Auditoria de stock: Diferencias entre stock y movimientos
SELECT 
    p.code,
    p.name,
    p.stock as stock_actual,
    COALESCE(SUM(
        CASE 
            WHEN sm.movement_type IN ('entry', 'adjustment') AND sm.quantity > 0 THEN sm.quantity
            WHEN sm.movement_type IN ('exit', 'adjustment') AND sm.quantity < 0 THEN sm.quantity
            ELSE 0
        END
    ), 0) as stock_calculado,
    p.stock - COALESCE(SUM(
        CASE 
            WHEN sm.movement_type IN ('entry', 'adjustment') AND sm.quantity > 0 THEN sm.quantity
            WHEN sm.movement_type IN ('exit', 'adjustment') AND sm.quantity < 0 THEN sm.quantity
            ELSE 0
        END
    ), 0) as diferencia
FROM products p
LEFT JOIN stock_movements sm ON p.id = sm.product_id
WHERE p.is_active = TRUE
GROUP BY p.id, p.code, p.name, p.stock
HAVING ABS(diferencia) > 0
ORDER BY ABS(diferencia) DESC;