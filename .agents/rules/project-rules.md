# ==============================================================================
# REGLAS GENERALES DE DESARROLLO - FERRETERÍA PRO (SGI)
# ==============================================================================

## 1. GESTOR DE PAQUETES Y ENTORNO
- **Gestor único obligatorio**: Usar siempre `pnpm` para instalar, actualizar o ejecutar scripts (`pnpm install`, `pnpm dev`, `pnpm run build`). Prohibido el uso de `npm` o `yarn`.
- **Bloqueo de lockfiles**: Mantener únicamente `pnpm-lock.yaml`. Prohibido generar o commitear `package-lock.json`.

---

## 2. COMPONENTES NATIVOS DE NEXT.JS
- **Imágenes**: Usar siempre `<Image />` importado de `next/image` para optimización automática de formatos (WebP/AVIF), lazy loading y prevención de CLS. Prohibido usar etiquetas nativas `<img>`.
- **Navegación**: Usar siempre `<Link />` importado de `next/link` para rutas internas de la aplicación. Prohibido usar `<a href="...">` para navegación interna.

---

## 3. SISTEMA DE DISEÑO Y TAILWIND CSS (v4+)
- **Prohibición de valores arbitrarios inline**: Prohibido usar colores hexadecimales inline en los componentes (ej: NO usar `bg-[#1e3a8a]` o `text-[#4534634]`).
- **Definición de tokens en `@theme`**: Todos los colores, degradados y fuentes corporativas deben registrarse en el archivo CSS global (`src/globals.css` o `global.css`) dentro del bloque `@theme` o `:root`:
  ```css
  /* En src/globals.css */
  @theme {
    --color-redgo: #4534634;
    --color-brand-primary: oklch(0.205 0 0);
    --color-brand-accent: oklch(0.646 0.222 41.116);
  }
  ```
  Y consumirse en los componentes mediante sus clases utilitarias: `bg-redgo`, `text-brand-accent`.
- **Sintaxis Tailwind v4**: Utilizar la nomenclatura utilitaria moderna (ej: `bg-linear-to-r` en lugar del obsoleto `bg-gradient-to-r`).

---

## 4. MODULARIZACIÓN Y LÍMITE DE LÍNEAS
- **Límite de tamaño**: Ningún componente debe superar las **150-200 líneas de código**.
- **Separación de responsabilidades**: Si un archivo maneja múltiples responsabilidades (tablas extensas, modales, formularios, lógica de exportación), debe dividirse de inmediato en subcomponentes modulares.
- **Ubicación modular**: Guardar los subcomponentes en `/src/components/<modulo>/` (ej: `/src/components/billing/InvoiceTable.tsx`, `/src/components/billing/InvoiceSummary.tsx`).
- **Server vs Client Components**: Mantener los componentes en el servidor (Server Components) por defecto. Aislar la directiva `"use client"` únicamente en las hojas del árbol que requieran interactividad nativa del navegador.

---

## 5. TYPESCRIPT ESTRICTO
- **Prohibición estricta de `any`**: Prohibido usar el tipo `any`. Tipar explícitamente Props, estados, respuestas de API y variables.
- **Manejo de errores seguro**: En bloques `catch`, tipar el error como `unknown` y verificar su tipo con `error instanceof Error ? error.message : 'Error desconocido'`.
- **Uniones sobre Enums**: Preferir tipos literales de unión (`role: 'admin' | 'cajero' | 'bodega'`) sobre `enum`.

---

## 6. SEGURIDAD Y BACKEND (SUPABASE & API ROUTES)
- **Protección de Endpoints**: Todo endpoint en `/api/*` que consulte o modifique datos debe validar obligatoriamente la sesión del usuario mediante `supabase.auth.getUser()`. Si no hay sesión, responder con `401 Unauthorized`.
- **Control de Roles**: Acciones sensibles (crear/eliminar usuarios, modificar configuración global) deben validar en el backend que el usuario tenga rol `admin` (`403 Forbidden` si no lo es).
- **Aislamiento de Secretos**: La variable `SUPABASE_SERVICE_ROLE_KEY` jamás debe exponerse en el cliente ni llevar el prefijo `NEXT_PUBLIC_`.
- **Privacidad en Logs**: Prohibido imprimir en `console.log` del servidor datos sensibles (contraseñas, NITs, teléfonos, correos, tokens).

---

## 7. FORMULARIOS, VALIDACIÓN Y FEEDBACK
- **Formularios robustos**: Utilizar `react-hook-form` con esquemas de validación mediante **Zod** para garantizar validación en cliente y servidor.
- **Feedback al usuario**: Toda acción asíncrona (guardar, editar, eliminar) debe mostrar retroalimentación mediante `sonner` (`toast.success()`, `toast.error()`).

---

## 8. FORMATEO DE MONEDA Y FECHAS
- **Centralización**: Prohibido aplicar transformaciones de moneda o fechas ad-hoc en cada componente. Utilizar siempre las funciones centralizadas en `src/lib/` (ej: `formatCurrency(value)` y `formatColombiaDate(date)`).

---

## 9. DOCUMENTACIÓN DE API INTERACTIVA
- **Ruta Docs**: Mantener actualizada la especificación en `src/lib/openapi.json` para la ruta interactiva `/docs` (`http://localhost:3000/docs`), restringida exclusivamente a entornos de desarrollo local.
