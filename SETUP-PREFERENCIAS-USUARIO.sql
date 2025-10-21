-- ================================================================
-- SCRIPT DE CONFIGURACIÓN: PREFERENCIAS DE USUARIO
-- ================================================================
-- Este script agrega la funcionalidad de preferencias de usuario
-- a la tabla profiles en Supabase.
-- 
-- Ejecuta este script en el SQL Editor de Supabase
-- ================================================================

-- 1. Agregar columna para preferencias de usuario en la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_preferences jsonb 
DEFAULT '{"theme": "light", "fontSize": "medium"}'::jsonb;

-- 2. Agregar comentario descriptivo
COMMENT ON COLUMN public.profiles.user_preferences IS 
'Preferencias visuales del usuario: theme (light/dark), fontSize (small/medium/large)';

-- 3. Actualizar usuarios existentes con preferencias por defecto (opcional)
UPDATE public.profiles 
SET user_preferences = '{"theme": "light", "fontSize": "medium"}'::jsonb
WHERE user_preferences IS NULL;

-- 4. Verificar que se aplicó correctamente
SELECT user_id, username, name, user_preferences 
FROM public.profiles 
LIMIT 5;

-- ================================================================
-- NOTAS:
-- ================================================================
-- - La columna user_preferences usa el tipo JSONB para flexibilidad
-- - Valores por defecto: {"theme": "light", "fontSize": "medium"}
-- - Los usuarios pueden cambiar sus preferencias desde la UI
-- - Las preferencias se guardan automáticamente por usuario
-- ================================================================
