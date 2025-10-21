# SEO Configuration - Ferretería Pro

## ✅ Implementaciones Completadas

### 1. **Metadata Mejorado** (`src/app/layout.tsx`)
- ✅ Título dinámico con template
- ✅ Descripción detallada con keywords relevantes
- ✅ Open Graph tags para redes sociales
- ✅ Twitter Card tags
- ✅ Configuración de robots (indexación controlada)
- ✅ Viewport optimizado
- ✅ Theme colors para modo claro/oscuro
- ✅ Manifest.json vinculado

### 2. **Archivos Generados**

#### `public/manifest.json`
- ✅ PWA manifest con información de la app
- ✅ Shortcuts para acceso rápido
- ✅ Configuración de display standalone

#### `public/robots.txt`
- ✅ Control de indexación de bots
- ✅ Protección de rutas sensibles (/api/, /admin/)
- ✅ Referencia al sitemap

#### `src/app/sitemap.ts`
- ✅ Generación dinámica de sitemap XML
- ✅ Configuración de prioridades y frecuencias

#### `src/app/opengraph-image.tsx`
- ✅ Generación dinámica de imagen Open Graph
- ✅ Imagen optimizada para compartir en redes sociales

## 📋 Tareas Pendientes (Opcionales)

### Iconos y Favicons

Para completar el SEO, necesitas agregar los siguientes archivos de íconos en la carpeta `public/`:

1. **favicon.ico** (32x32 o 16x16) - Favicon básico
2. **icon.png** (32x32) - Ícono PNG
3. **apple-icon.png** (180x180) - Ícono para dispositivos Apple
4. **icon-192.png** (192x192) - Ícono para PWA
5. **icon-512.png** (512x512) - Ícono para PWA (alta resolución)
6. **og-image.png** (1200x630) - Imagen estática de respaldo para Open Graph

**Opción 1: Usar un generador online**
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

**Opción 2: Usar el generador automático de Next.js**
El archivo `opengraph-image.tsx` ya genera la imagen OG dinámicamente.
Puedes crear archivos similares:
- `src/app/icon.tsx` - Para favicon dinámico
- `src/app/apple-icon.tsx` - Para ícono de Apple

### Configuraciones Adicionales

#### 1. Actualizar el dominio base
En `src/app/layout.tsx` línea 9:
```typescript
metadataBase: new URL('https://ferreteria-pro.vercel.app'), // ⚠️ CAMBIAR por tu dominio real
```

#### 2. Configurar indexación
Si la app es **pública**, en `src/app/layout.tsx`:
```typescript
robots: {
  index: true,  // Cambiar a true
  follow: true, // Cambiar a true
},
```

Y en `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
```

#### 3. Verificación de motores de búsqueda
Cuando tengas el dominio, agregar en `src/app/layout.tsx`:
```typescript
verification: {
  google: 'tu-codigo-de-verificacion-google',
  // bing: 'tu-codigo-de-verificacion-bing',
},
```

## 🎯 Beneficios Implementados

1. **SEO On-Page**: Metadata completo y estructurado
2. **Social Media**: Open Graph y Twitter Cards para compartir
3. **PWA Ready**: Manifest configurado para instalación
4. **Sitemap**: Generación automática para crawlers
5. **Robots.txt**: Control de indexación de bots
6. **Accesibilidad**: Lang, viewport y theme-color configurados
7. **Performance**: Imágenes OG generadas dinámicamente

## 📊 Verificación

Para verificar que todo funciona:

1. **Metadata**: Inspeccionar `<head>` en el navegador
2. **Open Graph**: Usar [Open Graph Debugger](https://www.opengraph.xyz/)
3. **Sitemap**: Visitar `http://localhost:3000/sitemap.xml`
4. **Robots**: Visitar `http://localhost:3000/robots.txt`
5. **Manifest**: Visitar `http://localhost:3000/manifest.json`
6. **OG Image**: Visitar `http://localhost:3000/opengraph-image`

## 🔍 Herramientas de Análisis

- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

**Nota**: Si esta es una aplicación interna/privada, mantener `robots.txt` con `Disallow: /` para evitar indexación.
