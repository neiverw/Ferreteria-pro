-- =============================================
-- BASE DE DATOS - SISTEMA FERRETERÍA PRO
-- =============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS ferreteria_pro;
USE ferreteria_pro;

-- =============================================
-- TABLA: categories (Categorías de productos)
-- =============================================
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: suppliers (Proveedores)
-- =============================================
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: users (Usuarios del sistema)
-- =============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('owner', 'employee') NOT NULL DEFAULT 'employee',
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: products (Productos/Inventario)
-- =============================================
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT,
    supplier_id INT,
    brand VARCHAR(100),
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    location VARCHAR(100),
    barcode VARCHAR(100),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    
    INDEX idx_name (name),
    INDEX idx_code (code),
    INDEX idx_category (category_id),
    INDEX idx_stock (stock),
    INDEX idx_active (is_active)
);

-- =============================================
-- TABLA: customers (Clientes)
-- =============================================
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    document VARCHAR(50),
    document_type ENUM('CC', 'NIT', 'CE', 'PASSPORT') DEFAULT 'CC',
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    department VARCHAR(100),
    registration_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_document (document),
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- =============================================
-- TABLA: invoices (Facturas)
-- =============================================
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT,
    user_id INT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 16.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('pending', 'paid', 'cancelled', 'overdue') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'transfer', 'credit') DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_customer (customer_id),
    INDEX idx_user (user_id),
    INDEX idx_date (invoice_date),
    INDEX idx_status (status)
);

-- =============================================
-- TABLA: invoice_items (Items de factura)
-- =============================================
CREATE TABLE invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    
    INDEX idx_invoice (invoice_id),
    INDEX idx_product (product_id)
);

-- =============================================
-- TABLA: stock_reports (Reportes de stock)
-- =============================================
CREATE TABLE stock_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_number VARCHAR(50) NOT NULL UNIQUE,
    product_id INT NOT NULL,
    reported_by INT NOT NULL,
    report_date DATE NOT NULL,
    report_time TIME NOT NULL,
    current_stock INT NOT NULL,
    reported_stock INT NOT NULL,
    difference INT GENERATED ALWAYS AS (reported_stock - current_stock) STORED,
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    status ENUM('pending', 'reviewed', 'resolved', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    location VARCHAR(100),
    resolved_by INT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_product (product_id),
    INDEX idx_reporter (reported_by),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_date (report_date)
);

-- =============================================
-- TABLA: stock_movements (Movimientos de inventario)
-- =============================================
CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    movement_type ENUM('entry', 'exit', 'adjustment', 'transfer') NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reference_type ENUM('invoice', 'purchase', 'adjustment', 'report') NOT NULL,
    reference_id INT,
    user_id INT NOT NULL,
    notes TEXT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_product (product_id),
    INDEX idx_type (movement_type),
    INDEX idx_date (movement_date),
    INDEX idx_reference (reference_type, reference_id)
);

-- =============================================
-- TABLA: system_settings (Configuraciones del sistema)
-- =============================================
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- INSERTAR DATOS INICIALES
-- =============================================

-- Categorías iniciales
INSERT INTO categories (name, description) VALUES
('Herramientas Manuales', 'Martillos, destornilladores, llaves, etc.'),
('Herramientas Eléctricas', 'Taladros, sierras, pulidoras, etc.'),
('Tornillería', 'Tornillos, tuercas, arandelas, etc.'),
('Pinturas', 'Pinturas, barnices, diluyentes, etc.'),
('Plomería', 'Tubos, accesorios, grifería, etc.'),
('Electricidad', 'Cables, interruptores, tomacorrientes, etc.'),
('Ferretería General', 'Candados, bisagras, herrajes, etc.'),
('Construcción', 'Cemento, arena, grava, etc.');

-- Proveedores iniciales
INSERT INTO suppliers (name, contact_name, phone, email, address) VALUES
('Distribuidora Central', 'Juan Pérez', '300-123-4567', 'ventas@distcentral.com', 'Calle 123 #45-67, Bogotá'),
('Herramientas Pro', 'María García', '301-987-6543', 'info@herramientaspro.com', 'Carrera 45 #12-34, Medellín'),
('Tornillos y Más', 'Carlos López', '302-555-1234', 'pedidos@tornillosymas.com', 'Avenida 80 #23-45, Cali'),
('Pinturas del Sur', 'Ana Rodríguez', '303-777-8899', 'ventas@pinturassur.com', 'Calle 50 #30-20, Barranquilla'),
('Distribuidora Hidráulica', 'Pepito Perez', '304-111-2222', 'comercial@disthidraulica.com', 'Carrera 15 #25-30, Bucaramanga'),
('Electro Mayorista', 'Laura González', '305-333-4444', 'ventas@electromayorista.com', 'Calle 72 #10-15, Medellín');

-- Usuarios iniciales (contraseñas hasheadas con bcrypt)
INSERT INTO users (username, name, email, password_hash, role, permissions) VALUES
('admin', 'Pepito Perez (Dueño)', 'admin@ferreteriapro.com', '$2b$10$rOWnhQ5QQ1cHCJ1.7FhKKu7GU7XJN8W9D5W8K9L1M2N3O4P5Q6R7S8', 'owner', '["all"]'),
('trabajador1', 'Ana García', 'ana.garcia@ferreteriapro.com', '$2b$10$rOWnhQ5QQ1cHCJ1.7FhKKu7GU7XJN8W9D5W8K9L1M2N3O4P5Q6R7S8', 'employee', '["inventory", "billing", "dashboard", "reports"]'),
('trabajador2', 'Carlos López', 'carlos.lopez@ferreteriapro.com', '$2b$10$rOWnhQ5QQ1cHCJ1.7FhKKu7GU7XJN8W9D5W8K9L1M2N3O4P5Q6R7S8', 'employee', '["inventory", "billing", "dashboard", "reports"]'),
('trabajador3', 'María Rodríguez', 'maria.rodriguez@ferreteriapro.com', '$2b$10$rOWnhQ5QQ1cHCJ1.7FhKKu7GU7XJN8W9D5W8K9L1M2N3O4P5Q6R7S8', 'employee', '["inventory", "billing", "dashboard", "reports"]'),
('trabajador4', 'José Hernández', 'jose.hernandez@ferreteriapro.com', '$2b$10$rOWnhQ5QQ1cHCJ1.7FhKKu7GU7XJN8W9D5W8K9L1M2N3O4P5Q6R7S8', 'employee', '["inventory", "billing", "dashboard", "reports"]');

-- Productos iniciales
INSERT INTO products (code, name, description, category_id, supplier_id, brand, stock, min_stock, price, cost, location) VALUES
('HM001', 'Martillo de Garra 16oz', 'Martillo de garra con mango ergonómico', 1, 1, 'Stanley', 0, 10, 1250.00, 950.00, 'Estante A-1'),
('HE001', 'Taladro Inalámbrico 18V', 'Taladro inalámbrico con batería de litio', 2, 2, 'DeWalt', 3, 5, 8900.00, 6200.00, 'Vitrina B-3'),
('TO001', 'Tornillos Autorroscantes 1/2"', 'Caja con 50 unidades de tornillos', 3, 3, 'Generic', 15, 100, 15.00, 8.00, 'Cajón C-12'),
('PI001', 'Pintura Látex Blanco 4L', 'Pintura látex para interiores', 4, 4, 'Sherwin Williams', 2, 8, 3200.00, 2100.00, 'Bodega D-1'),
('PL001', 'Tubo PVC 4" x 6m', 'Tubo PVC sanitario de 4 pulgadas', 5, 5, 'Pavco', 0, 5, 2800.00, 1950.00, 'Patio E-2'),
('EL001', 'Cable Eléctrico 12 AWG', 'Cable eléctrico calibre 12 AWG por metro', 6, 6, 'Procables', 150, 50, 85.00, 58.00, 'Estante F-4');

-- Clientes iniciales
INSERT INTO customers (name, document, document_type, phone, email, address, city, department, registration_date) VALUES
('Juan Pérez', '12345678', 'CC', '300-123-4567', 'juan.perez@email.com', 'Calle 123 #45-67', 'Bogotá', 'Cundinamarca', '2024-01-15'),
('María García', '87654321', 'CC', '301-987-6543', 'maria.garcia@email.com', 'Carrera 45 #12-34', 'Medellín', 'Antioquia', '2024-01-10'),
('Carlos Rodríguez', '11223344', 'CC', '302-555-1234', 'carlos.rodriguez@email.com', 'Avenida 80 #23-45', 'Cali', 'Valle del Cauca', '2024-01-05'),
('Ana López', '55667788', 'CC', '303-777-8899', 'ana.lopez@email.com', 'Calle 50 #30-20', 'Barranquilla', 'Atlántico', '2024-01-08'),
('Pepito Perez', '99887766', 'CC', '304-111-2222', 'pepito.perez@email.com', 'Carrera 15 #25-30', 'Bucaramanga', 'Santander', '2024-01-12');

-- Configuraciones del sistema
INSERT INTO system_settings (setting_key, setting_value, description, data_type) VALUES
('company_name', 'Ferretería Pro', 'Nombre de la empresa', 'string'),
('company_nit', '900123456-7', 'NIT de la empresa', 'string'),
('company_address', 'Calle Principal #123-45, Ciudad', 'Dirección de la empresa', 'string'),
('company_phone', '(601) 234-5678', 'Teléfono de la empresa', 'string'),
('company_email', 'info@ferreteriapro.com', 'Email de la empresa', 'string'),
('tax_rate', '16.00', 'Tasa de IVA por defecto', 'number'),
('currency', 'COP', 'Moneda por defecto', 'string'),
('low_stock_threshold', '10', 'Umbral para stock bajo', 'number'),
('invoice_prefix', 'FAC', 'Prefijo para facturas', 'string'),
('report_prefix', 'RPT', 'Prefijo para reportes', 'string');

-- =============================================
-- TRIGGERS Y PROCEDIMIENTOS
-- =============================================

-- Trigger para actualizar stock al crear invoice_items
DELIMITER //
CREATE TRIGGER update_stock_on_sale 
AFTER INSERT ON invoice_items
FOR EACH ROW
BEGIN
    -- Actualizar stock del producto
    UPDATE products 
    SET stock = stock - NEW.quantity 
    WHERE id = NEW.product_id;
    
    -- Registrar movimiento de stock
    INSERT INTO stock_movements (
        product_id, movement_type, quantity, 
        previous_stock, new_stock, reference_type, 
        reference_id, user_id, notes
    )
    SELECT 
        NEW.product_id, 'exit', NEW.quantity,
        p.stock + NEW.quantity, p.stock, 'invoice',
        NEW.invoice_id, i.user_id, CONCAT('Venta - Factura ', i.invoice_number)
    FROM products p
    JOIN invoices i ON i.id = NEW.invoice_id
    WHERE p.id = NEW.product_id;
END//

-- Trigger para actualizar totales de factura
CREATE TRIGGER update_invoice_totals
AFTER INSERT ON invoice_items
FOR EACH ROW
BEGIN
    UPDATE invoices 
    SET 
        subtotal = (SELECT SUM(total) FROM invoice_items WHERE invoice_id = NEW.invoice_id),
        tax_amount = subtotal * (tax_rate / 100),
        total = subtotal + tax_amount
    WHERE id = NEW.invoice_id;
END//

-- Procedimiento para generar número de factura
CREATE PROCEDURE GenerateInvoiceNumber(OUT invoice_num VARCHAR(50))
BEGIN
    DECLARE counter INT DEFAULT 1;
    DECLARE prefix VARCHAR(10);
    
    SELECT setting_value INTO prefix 
    FROM system_settings 
    WHERE setting_key = 'invoice_prefix';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, LENGTH(prefix) + 2) AS UNSIGNED)), 0) + 1 
    INTO counter
    FROM invoices 
    WHERE invoice_number LIKE CONCAT(prefix, '-%');
    
    SET invoice_num = CONCAT(prefix, '-', YEAR(CURDATE()), '-', LPAD(counter, 3, '0'));
END//

-- Procedimiento para generar número de reporte
CREATE PROCEDURE GenerateReportNumber(OUT report_num VARCHAR(50))
BEGIN
    DECLARE counter INT DEFAULT 1;
    DECLARE prefix VARCHAR(10);
    
    SELECT setting_value INTO prefix 
    FROM system_settings 
    WHERE setting_key = 'report_prefix';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(report_number, LENGTH(prefix) + 2) AS UNSIGNED)), 0) + 1 
    INTO counter
    FROM stock_reports 
    WHERE report_number LIKE CONCAT(prefix, '-%');
    
    SET report_num = CONCAT(prefix, '-', LPAD(counter, 3, '0'));
END//

DELIMITER ;

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista de productos con stock bajo
CREATE VIEW products_low_stock AS
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
WHERE p.stock <= p.min_stock AND p.is_active = TRUE;

-- Vista de resumen de ventas por producto
CREATE VIEW product_sales_summary AS
SELECT 
    p.id,
    p.code,
    p.name,
    COUNT(ii.id) as times_sold,
    SUM(ii.quantity) as total_quantity_sold,
    SUM(ii.total) as total_revenue,
    AVG(ii.unit_price) as avg_selling_price
FROM products p
LEFT JOIN invoice_items ii ON p.id = ii.product_id
LEFT JOIN invoices i ON ii.invoice_id = i.id
WHERE i.status = 'paid'
GROUP BY p.id, p.code, p.name;

-- Vista de reportes pendientes por prioridad
CREATE VIEW pending_reports_summary AS
SELECT 
    sr.priority,
    COUNT(*) as report_count,
    GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as products_affected
FROM stock_reports sr
JOIN products p ON sr.product_id = p.id
WHERE sr.status = 'pending'
GROUP BY sr.priority
ORDER BY FIELD(sr.priority, 'critical', 'high', 'medium', 'low');