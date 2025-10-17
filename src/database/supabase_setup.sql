-- =============================================
-- CONFIGURACIÓN PARA SUPABASE
-- Sistema Ferretería Pro
-- =============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================

-- Habilitar Row Level Security en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS DE ACCESO
-- =============================================

-- Política para usuarios autenticados - Categorías
CREATE POLICY "authenticated_users_categories" ON categories
    FOR ALL TO authenticated USING (true);

-- Política para usuarios autenticados - Proveedores
CREATE POLICY "authenticated_users_suppliers" ON suppliers
    FOR ALL TO authenticated USING (true);

-- Política para usuarios - Solo pueden ver/editar su propia información
CREATE POLICY "users_own_data" ON users
    FOR ALL TO authenticated USING (auth.uid()::text = id::text);

-- Política para productos - Acceso completo para autenticados
CREATE POLICY "authenticated_users_products" ON products
    FOR ALL TO authenticated USING (true);

-- Política para clientes - Acceso completo para autenticados
CREATE POLICY "authenticated_users_customers" ON customers
    FOR ALL TO authenticated USING (true);

-- Política para facturas - Acceso completo para autenticados
CREATE POLICY "authenticated_users_invoices" ON invoices
    FOR ALL TO authenticated USING (true);

-- Política para items de factura - Acceso completo para autenticados
CREATE POLICY "authenticated_users_invoice_items" ON invoice_items
    FOR ALL TO authenticated USING (true);

-- Política para reportes de stock - Acceso completo para autenticados
CREATE POLICY "authenticated_users_stock_reports" ON stock_reports
    FOR ALL TO authenticated USING (true);

-- Política para movimientos de stock - Acceso completo para autenticados
CREATE POLICY "authenticated_users_stock_movements" ON stock_movements
    FOR ALL TO authenticated USING (true);

-- Política para configuraciones - Solo lectura para empleados, completo para owners
CREATE POLICY "system_settings_read" ON system_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "system_settings_modify" ON system_settings
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'owner'
        )
    );

-- =============================================
-- FUNCIONES PERSONALIZADAS
-- =============================================

-- Función para obtener el usuario actual
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS users AS $$
BEGIN
    RETURN (
        SELECT users.* FROM users 
        WHERE users.id = auth.uid()::text 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es propietario
CREATE OR REPLACE FUNCTION is_owner()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'owner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
    counter integer;
    prefix text;
    year_suffix text;
BEGIN
    -- Obtener prefijo de configuración
    SELECT setting_value INTO prefix 
    FROM system_settings 
    WHERE setting_key = 'invoice_prefix';
    
    IF prefix IS NULL THEN
        prefix := 'FAC';
    END IF;
    
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::text;
    
    -- Obtener siguiente número
    SELECT COALESCE(
        MAX(
            CAST(
                SPLIT_PART(
                    SPLIT_PART(invoice_number, '-', 3), 
                    '', 1
                ) AS integer
            )
        ), 0
    ) + 1 INTO counter
    FROM invoices 
    WHERE invoice_number LIKE prefix || '-' || year_suffix || '-%';
    
    RETURN prefix || '-' || year_suffix || '-' || LPAD(counter::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de reporte
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS text AS $$
DECLARE
    counter integer;
    prefix text;
BEGIN
    -- Obtener prefijo de configuración
    SELECT setting_value INTO prefix 
    FROM system_settings 
    WHERE setting_key = 'report_prefix';
    
    IF prefix IS NULL THEN
        prefix := 'RPT';
    END IF;
    
    -- Obtener siguiente número
    SELECT COALESCE(
        MAX(
            CAST(
                SPLIT_PART(report_number, '-', 2) AS integer
            )
        ), 0
    ) + 1 INTO counter
    FROM stock_reports 
    WHERE report_number LIKE prefix || '-%';
    
    RETURN prefix || '-' || LPAD(counter::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS PARA SUPABASE
-- =============================================

-- Trigger para actualizar stock al insertar items de factura
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS trigger AS $$
BEGIN
    -- Actualizar stock del producto
    UPDATE products 
    SET stock = stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Insertar movimiento de stock
    INSERT INTO stock_movements (
        product_id, movement_type, quantity, 
        previous_stock, new_stock, reference_type, 
        reference_id, user_id, notes
    )
    SELECT 
        NEW.product_id, 'exit', NEW.quantity,
        p.stock + NEW.quantity, p.stock, 'invoice',
        NEW.invoice_id, i.user_id, 'Venta - Factura ' || i.invoice_number
    FROM products p
    JOIN invoices i ON i.id = NEW.invoice_id
    WHERE p.id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_sale
    AFTER INSERT ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Trigger para actualizar totales de factura
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS trigger AS $$
DECLARE
    invoice_subtotal decimal(12,2);
    tax_rate decimal(5,2);
    tax_amount decimal(12,2);
    invoice_total decimal(12,2);
BEGIN
    -- Calcular subtotal
    SELECT COALESCE(SUM(total), 0) INTO invoice_subtotal
    FROM invoice_items 
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Obtener tasa de impuesto
    SELECT COALESCE(
        (SELECT CAST(setting_value AS decimal) FROM system_settings WHERE setting_key = 'tax_rate'),
        16.00
    ) INTO tax_rate;
    
    -- Calcular impuesto y total
    tax_amount := invoice_subtotal * (tax_rate / 100);
    invoice_total := invoice_subtotal + tax_amount;
    
    -- Actualizar factura
    UPDATE invoices 
    SET 
        subtotal = invoice_subtotal,
        tax_amount = tax_amount,
        total = invoice_total,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- Trigger para timestamps automáticos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a las tablas necesarias
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_reports_updated_at BEFORE UPDATE ON stock_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VISTAS PARA REALTIME
-- =============================================

-- Vista para dashboard en tiempo real
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
    (SELECT COUNT(*) FROM invoices WHERE DATE(invoice_date) = CURRENT_DATE) as daily_sales,
    (SELECT COUNT(*) FROM products WHERE stock <= min_stock AND is_active = true) as low_stock_products,
    (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE DATE(invoice_date) = CURRENT_DATE AND status = 'paid') as daily_revenue,
    (SELECT COUNT(*) FROM stock_reports WHERE status = 'pending') as pending_reports;

-- Vista para productos con stock bajo
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.*,
    c.name as category_name,
    s.name as supplier_name,
    CASE 
        WHEN p.stock = 0 THEN 'critical'
        WHEN p.stock <= p.min_stock THEN 'low'
        ELSE 'normal'
    END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.stock <= p.min_stock AND p.is_active = true;

-- =============================================
-- CONFIGURACIÓN DE REALTIME
-- =============================================

-- Habilitar realtime para las tablas principales
-- (Esto se debe hacer desde el dashboard de Supabase)

/*
REALTIME TABLES TO ENABLE:
- products (para actualizaciones de stock)
- invoices (para ventas en tiempo real)
- stock_reports (para reportes)
- customers (para nuevos clientes)
- dashboard_metrics (para métricas en vivo)
- low_stock_products (para alertas)
*/

-- =============================================
-- FUNCIONES PARA API
-- =============================================

-- Función para crear factura completa
CREATE OR REPLACE FUNCTION create_invoice_with_items(
    p_customer_id integer,
    p_items jsonb
)
RETURNS jsonb AS $$
DECLARE
    new_invoice_id integer;
    new_invoice_number text;
    item jsonb;
    result jsonb;
BEGIN
    -- Generar número de factura
    SELECT generate_invoice_number() INTO new_invoice_number;
    
    -- Crear factura
    INSERT INTO invoices (
        invoice_number, customer_id, user_id, invoice_date, status
    ) VALUES (
        new_invoice_number, p_customer_id, auth.uid()::integer, CURRENT_DATE, 'pending'
    ) RETURNING id INTO new_invoice_id;
    
    -- Insertar items
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO invoice_items (
            invoice_id, product_id, product_name, quantity, unit_price, total
        ) VALUES (
            new_invoice_id,
            (item->>'product_id')::integer,
            item->>'product_name',
            (item->>'quantity')::decimal,
            (item->>'unit_price')::decimal,
            (item->>'total')::decimal
        );
    END LOOP;
    
    -- Retornar resultado
    SELECT jsonb_build_object(
        'success', true,
        'invoice_id', new_invoice_id,
        'invoice_number', new_invoice_number
    ) INTO result;
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para reportar stock
CREATE OR REPLACE FUNCTION create_stock_report(
    p_product_id integer,
    p_reported_stock integer,
    p_priority text,
    p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    new_report_number text;
    current_stock integer;
    result jsonb;
BEGIN
    -- Obtener stock actual del producto
    SELECT stock INTO current_stock FROM products WHERE id = p_product_id;
    
    -- Generar número de reporte
    SELECT generate_report_number() INTO new_report_number;
    
    -- Crear reporte
    INSERT INTO stock_reports (
        report_number, product_id, reported_by, report_date, report_time,
        current_stock, reported_stock, priority, status, notes
    ) VALUES (
        new_report_number, p_product_id, auth.uid()::integer, CURRENT_DATE, CURRENT_TIME,
        current_stock, p_reported_stock, p_priority, 'pending', p_notes
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'report_number', new_report_number
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;