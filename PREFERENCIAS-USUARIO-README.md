# 🎨 Configuración de Preferencias de Usuario

## ✅ Implementación Completada

Se ha implementado exitosamente el sistema de **Preferencias de Usuario** separado de la **Configuración del Sistema**.

---

## 📋 Estructura Implementada

### 1️⃣ **Configuración del Sistema** (Solo Admin)
- Nombre de la ferretería
- Moneda y formatos
- IVA
- Notificaciones de inventario
- Otras configuraciones globales del negocio

### 2️⃣ **Preferencias de Usuario** (Todos los usuarios)
- 🌓 Modo claro/oscuro
- 📏 Tamaño de fuente (pequeño/mediano/grande)
- Se guardan por usuario en la base de datos
- Accesible desde el sidebar para todos los roles

---

## 🚀 Pasos para Activar

### 1. Ejecutar SQL en Supabase

Abre el **SQL Editor** en tu proyecto de Supabase y ejecuta el archivo:
```
SETUP-PREFERENCIAS-USUARIO.sql
```

O copia y ejecuta este código:

```sql
-- Agregar columna para preferencias de usuario
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_preferences jsonb 
DEFAULT '{"theme": "light", "fontSize": "medium"}'::jsonb;

-- Actualizar usuarios existentes
UPDATE public.profiles 
SET user_preferences = '{"theme": "light", "fontSize": "medium"}'::jsonb
WHERE user_preferences IS NULL;
```

### 2. Reiniciar el servidor de desarrollo

```powershell
# Detener el servidor si está corriendo (Ctrl+C)
# Luego iniciar nuevamente
npm run dev
```

---

## 🎯 Características

### ✨ Modo Claro/Oscuro
- Los usuarios pueden elegir entre modo claro y oscuro
- El cambio es instantáneo y se guarda automáticamente
- Cada usuario tiene su propia preferencia

### 📝 Tamaño de Fuente
- **Pequeño**: 14px
- **Mediano**: 16px (por defecto)
- **Grande**: 18px

### 💾 Persistencia
- Las preferencias se guardan en la base de datos
- Se cargan automáticamente al iniciar sesión
- Cada usuario mantiene sus propias configuraciones

---

## 📂 Archivos Creados/Modificados

### Nuevos archivos:
- `src/app/api/user-preferences/route.ts` - API para guardar/obtener preferencias
- `src/components/user-preferences.tsx` - Componente de UI de preferencias
- `src/components/theme-provider.tsx` - Context provider para tema
- `SETUP-PREFERENCIAS-USUARIO.sql` - Script SQL de configuración

### Archivos modificados:
- `src/app/page.tsx` - Agregado "Preferencias" al sidebar
- `src/app/layout.tsx` - Soporte para next-themes
- `src/globals.css` - Estilos para tamaños de fuente

---

## 🔧 Uso

### Para usuarios finales:
1. Hacer clic en **"Preferencias"** en el sidebar (visible para todos)
2. Seleccionar el modo (claro/oscuro)
3. Seleccionar el tamaño de fuente
4. Hacer clic en **"Guardar Cambios"**

### Para administradores:
- La opción **"Configuración"** sigue siendo exclusiva del admin
- Contiene las configuraciones globales del sistema

---

## 🎨 Diferencias Clave

| Aspecto | Configuración del Sistema | Preferencias de Usuario |
|---------|---------------------------|-------------------------|
| **Acceso** | Solo Admin | Todos los usuarios |
| **Alcance** | Global (todo el sistema) | Personal (cada usuario) |
| **Contenido** | Negocio, IVA, moneda, etc. | Tema, fuente, apariencia |
| **Ubicación** | Pestaña "Configuración" | Pestaña "Preferencias" |

---

## ✅ Verificación

Para verificar que todo funciona correctamente:

1. ✅ Ejecutar el SQL en Supabase
2. ✅ Reiniciar el servidor
3. ✅ Iniciar sesión con cualquier usuario
4. ✅ Verificar que aparece "Preferencias" en el sidebar
5. ✅ Cambiar el tema y verificar que se aplica
6. ✅ Cambiar el tamaño de fuente y verificar
7. ✅ Cerrar sesión y volver a entrar (preferencias deben persistir)

---

## 🐛 Troubleshooting

**Problema**: No aparece "Preferencias" en el sidebar
- **Solución**: Verificar que ejecutaste el SQL en Supabase y reiniciaste el servidor

**Problema**: El tema no cambia
- **Solución**: Verificar que la columna `user_preferences` existe en la tabla `profiles`

**Problema**: No se guardan las preferencias
- **Solución**: Revisar la consola del navegador para errores de API

---

## 📱 Próximas Mejoras Posibles

- [ ] Agregar más temas de color personalizados
- [ ] Preferencia de idioma (ES/EN)
- [ ] Densidad de la interfaz (compacta/cómoda/espaciosa)
- [ ] Preferencias de notificaciones
- [ ] Exportar/importar configuraciones

---

¡Listo! El sistema de preferencias de usuario está completamente funcional. 🎉
