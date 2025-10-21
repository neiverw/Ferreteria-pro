-- ========================================
-- SOLUCIÓN DEFINITIVA PARA FECHAS DE FACTURAS
-- ========================================
-- Este script corrige el problema de fechas incorrectas debido a conversión de zona horaria

-- OPCIÓN 1: Cambiar el tipo de columna a TEXT (más simple)
-- Esto evita cualquier conversión de zona horaria de PostgreSQL
ALTER TABLE public.invoices 
ALTER COLUMN invoice_date TYPE TEXT;

ALTER TABLE public.invoices 
ALTER COLUMN due_date TYPE TEXT;

-- OPCIÓN 2 (ALTERNATIVA): Si prefieres mantener tipo DATE, cambiar el default
-- Descomenta estas líneas y comenta las de arriba
-- ALTER TABLE public.invoices 
-- ALTER COLUMN invoice_date SET DEFAULT (CURRENT_DATE AT TIME ZONE 'America/Bogota');

-- Verificar los cambios
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
  AND column_name IN ('invoice_date', 'due_date');

-- ========================================
-- IMPORTANTE: 
-- Después de ejecutar este script, las nuevas facturas 
-- se guardarán con la fecha correcta de Colombia
-- ========================================
