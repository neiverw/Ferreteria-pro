-- ==============================================================================
-- MIGRACIÓN MULTI-TENANT PARA FERRETERÍA PRO SAAS
-- ==============================================================================
-- Ejecuta este script completo en el SQL Editor de tu Dashboard de Supabase.
-- ==============================================================================

-- 1. CREAR LA TABLA DE FERRETERÍAS / TIENDAS
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  nit text,
  address text,
  city text,
  phone text,
  email text,
  business_type text DEFAULT 'ferreteria_general',
  plan text DEFAULT 'pro',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);

-- 2. VINCULAR PERFILES A SU FERRETERÍA
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

-- 3. AGREGAR STORE_ID A TODAS LAS TABLAS DE NEGOCIO
ALTER TABLE public.categories 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.suppliers 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.customers 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.stock_reports 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.stock_movements 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.system_settings 
  ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE;

-- 4. AJUSTAR CONSTRAINTS PARA AISLAMIENTO MULTI-TIENDA
-- 4.1 System Settings: Clave única por tienda
ALTER TABLE public.system_settings DROP CONSTRAINT IF EXISTS system_settings_setting_key_key;
ALTER TABLE public.system_settings DROP CONSTRAINT IF EXISTS system_settings_store_key_unique;
ALTER TABLE public.system_settings 
  ADD CONSTRAINT system_settings_store_key_unique UNIQUE (store_id, setting_key);

-- 4.2 Invoices: Número de factura único por tienda (no global)
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_store_invoice_number_unique;
ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_store_invoice_number_unique UNIQUE (store_id, invoice_number);

-- 5. FUNCIÓN PARA OBTENER EL STORE_ID DEL USUARIO AUTENTICADO
CREATE OR REPLACE FUNCTION public.get_current_user_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT store_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 6. TRIGGER PARA ASIGNAR STORE_ID AUTOMÁTICAMENTE EN INSERCIONES
CREATE OR REPLACE FUNCTION public.auto_set_store_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.store_id IS NULL THEN
    NEW.store_id := public.get_current_user_store_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Asignar triggers automáticos
DROP TRIGGER IF EXISTS trigger_set_store_id_products ON public.products;
CREATE TRIGGER trigger_set_store_id_products
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_store_id();

DROP TRIGGER IF EXISTS trigger_set_store_id_customers ON public.customers;
CREATE TRIGGER trigger_set_store_id_customers
  BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_store_id();

DROP TRIGGER IF EXISTS trigger_set_store_id_invoices ON public.invoices;
CREATE TRIGGER trigger_set_store_id_invoices
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_store_id();

DROP TRIGGER IF EXISTS trigger_set_store_id_categories ON public.categories;
CREATE TRIGGER trigger_set_store_id_categories
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_store_id();

DROP TRIGGER IF EXISTS trigger_set_store_id_suppliers ON public.suppliers;
CREATE TRIGGER trigger_set_store_id_suppliers
  BEFORE INSERT ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_store_id();

DROP TRIGGER IF EXISTS trigger_set_store_id_stock_reports ON public.stock_reports;
CREATE TRIGGER trigger_set_store_id_stock_reports
  BEFORE INSERT ON public.stock_reports
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_store_id();

DROP TRIGGER IF EXISTS trigger_set_store_id_stock_movements ON public.stock_movements;
CREATE TRIGGER trigger_set_store_id_stock_movements
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.auto_set_store_id();

-- 7. RPC SEGURA PARA INSERCIÓN DE ITEMS DE FACTURA
DROP FUNCTION IF EXISTS public.insert_invoice_item_safe(uuid,uuid,text,text,numeric,numeric,numeric);
DROP FUNCTION IF EXISTS public.insert_invoice_item_safe;

CREATE OR REPLACE FUNCTION public.insert_invoice_item_safe(
  p_invoice_id uuid,
  p_product_id uuid,
  p_product_name text,
  p_product_code text,
  p_quantity numeric,
  p_unit_price numeric,
  p_discount numeric DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_id uuid;
BEGIN
  INSERT INTO public.invoice_items (
    invoice_id,
    product_id,
    product_name,
    product_code,
    quantity,
    unit_price,
    discount,
    total
  ) VALUES (
    p_invoice_id,
    p_product_id,
    p_product_name,
    p_product_code,
    p_quantity,
    p_unit_price,
    p_discount,
    (p_quantity * p_unit_price) - p_discount
  ) RETURNING id INTO v_item_id;
  
  RETURN v_item_id;
END;
$$;

-- 8. HABILITAR ROW LEVEL SECURITY (RLS) PARA AISLAR DATOS POR FERRETERÍA
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores si existían
DROP POLICY IF EXISTS "tenant_isolation_stores" ON public.stores;
DROP POLICY IF EXISTS "tenant_isolation_products" ON public.products;
DROP POLICY IF EXISTS "tenant_isolation_customers" ON public.customers;
DROP POLICY IF EXISTS "tenant_isolation_invoices" ON public.invoices;
DROP POLICY IF EXISTS "tenant_isolation_invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "tenant_isolation_categories" ON public.categories;
DROP POLICY IF EXISTS "tenant_isolation_suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "tenant_isolation_stock_reports" ON public.stock_reports;
DROP POLICY IF EXISTS "tenant_isolation_stock_movements" ON public.stock_movements;
DROP POLICY IF EXISTS "tenant_isolation_system_settings" ON public.system_settings;

-- Crear políticas de aislamiento por ferretería (con USING y WITH CHECK permisivo para multi-tenant)
CREATE POLICY "tenant_isolation_stores" ON public.stores
  FOR ALL
  USING (id = public.get_current_user_store_id())
  WITH CHECK (id = public.get_current_user_store_id());

CREATE POLICY "tenant_isolation_products" ON public.products
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);

CREATE POLICY "tenant_isolation_customers" ON public.customers
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);

CREATE POLICY "tenant_isolation_invoices" ON public.invoices
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);

CREATE POLICY "tenant_isolation_invoice_items" ON public.invoice_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tenant_isolation_categories" ON public.categories
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);

CREATE POLICY "tenant_isolation_suppliers" ON public.suppliers
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);

CREATE POLICY "tenant_isolation_stock_reports" ON public.stock_reports
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);

CREATE POLICY "tenant_isolation_stock_movements" ON public.stock_movements
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);

CREATE POLICY "tenant_isolation_system_settings" ON public.system_settings
  FOR ALL
  USING (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL)
  WITH CHECK (store_id = public.get_current_user_store_id() OR public.get_current_user_store_id() IS NULL);
