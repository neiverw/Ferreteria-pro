# 🏪 Guía Rápida de Usuario - Sistema de Gestión para Ferretería

### 📱 Manual Simplificado para Usuarios

---

## 🎯 ¿Qué puedes hacer con este sistema?

Este sistema te ayuda a:
- ✅ Vender productos y generar facturas
- ✅ Controlar el inventario de tu ferretería
- ✅ Gestionar tus clientes y proveedores
- ✅ Ver reportes de ventas
- ✅ Controlar el dinero de la caja

---

## 🚀 Primeros Pasos

### 1. Entrar al Sistema

1. Abre tu navegador (Chrome, Firefox, Edge)
2. Ve a la dirección de tu sistema
3. Verás una pantalla de inicio de sesión:

```
┌─────────────────────────────┐
│   🏪 TU FERRETERÍA          │
│                             │
│   Usuario: [________]       │
│   Contraseña: [________]    │
│                             │
│   [  Iniciar Sesión  ]      │
└─────────────────────────────┘
```

4. Escribe tu usuario y contraseña
5. Presiona "Iniciar Sesión"

> 💡 **Consejo:** Si olvidaste tu contraseña, contacta al administrador del sistema

---

## 👥 ¿Qué puedo ver según mi rol?

El sistema tiene 3 tipos de usuarios:

### 👑 Administrador
**Ve y controla TODO:**
- Dashboard con resumen del negocio
- Inventario completo
- Proveedores
- Facturación y ventas
- Clientes
- Reportes
- Configuración del sistema

### 💳 Cajero
**Enfocado en ventas:**
- Inventario (para consultar)
- Facturación y ventas
- Clientes
- Reportes

### 📦 Bodega
**Enfocado en productos:**
- Inventario (agregar/quitar productos)
- Reportes de inventario

---

## 🧭 Conociendo la Pantalla Principal

Cuando entras, verás:

```
┌─────────────────────────────────────────────────────────┐
│ [☰]  Sección Actual          Juan Pérez (Admin)  [Salir]│ ← BARRA SUPERIOR
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  MENÚ    │         CONTENIDO PRINCIPAL                  │
│          │                                              │
│ 📊 Inicio│    Aquí verás la información de cada         │
│ 📦 Invent│    sección que selecciones                   │
│ 👥 Prove │                                              │
│ 📄 Factur│                                              │
│ 👤 Client│                                              │
│ 📈 Report│                                              │
│ ⚙️ Config│                                              │
│          │                                              │
│  ↑       │                                              │
│  LATERAL │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 🔹 Menú Lateral (Izquierda)
Aquí seleccionas qué quieres hacer. Solo verás las opciones que tu rol permite.

### 🔹 Barra Superior
- **Botón [☰]:** Oculta o muestra el menú
- **Título:** Te dice en qué sección estás
- **Tu nombre:** Muestra tu usuario actual
- **Botón Salir:** Para cerrar sesión

---

## 📊 1. Pantalla de Inicio (Dashboard)

**Solo para Administradores**

Aquí ves un resumen de todo:

```
┌──────────────────┬──────────────────┬──────────────────┐
│ 💰 Ventas Mes    │ 📦 Productos     │ 👥 Clientes      │
│ $15,500,000      │ 1,234 items      │ 89 activos       │
└──────────────────┴──────────────────┴──────────────────┘

┌────────────────────────────────────────────────────────┐
│  📈 GRÁFICO DE VENTAS DEL MES                          │
│                                                        │
│      ▄                                                 │
│     ▄█▄     ▄                                          │
│    ▄███▄   ▄█▄                                         │
│   ▄█████▄▄████▄                                        │
│  ▄███████████████                                      │
│ ────────────────────────────────────                   │
│  L  M  M  J  V  S  D                                   │
└────────────────────────────────────────────────────────┘

⚠️ ALERTAS:
🔴 5 productos con stock bajo
⚠️ 2 productos próximos a vencer
```

**¿Qué hacer aquí?**
- Ver cómo van las ventas
- Revisar alertas importantes
- Tener una vista general del negocio

---

## 📦 2. Inventario - Gestionar Productos

Esta es una de las secciones más importantes.

### ✅ Ver todos los productos

Verás una tabla como esta:

| Código | Producto        | Stock | Precio  | Acciones        |
|--------|-----------------|-------|---------|-----------------|
| 001    | Martillo 16oz   | 25    | $45,000 | [✏️] [🗑️] [➕] |
| 002    | Tornillos 1/4"  | 150   | $500    | [✏️] [🗑️] [➕] |
| 003    | Cemento 50kg    | 8 🔴  | $25,000 | [✏️] [🗑️] [➕] |

> 🔴 Indica que el stock está bajo

**Puedes:**
- 🔍 **Buscar:** Escribe el nombre del producto en el buscador
- 🎯 **Filtrar:** Por categoría, proveedor, etc.
- 📄 Ver productos activos o inactivos

---

### ➕ Agregar un Nuevo Producto

1. Haz clic en el botón **"+ Nuevo Producto"**

2. Llena el formulario:

```
┌─────────────────────────────────┐
│  AGREGAR NUEVO PRODUCTO         │
├─────────────────────────────────┤
│  Código/SKU: [_____________]    │
│  Nombre: [_________________]    │
│  Descripción: [____________]    │
│  Categoría: [▼ Seleccionar]     │
│  Proveedor: [▼ Seleccionar]     │
│                                 │
│  Stock Inicial: [___]           │
│  Stock Mínimo: [___]            │
│                                 │
│  Precio Compra: $[_______]      │
│  Precio Venta: $[________]      │
│                                 │
│  Ubicación: [_____________]     │
│                                 │
│  [Cancelar]     [💾 Guardar]    │
└─────────────────────────────────┘
```

3. Haz clic en **"Guardar"**

> 💡 **Tip:** El Stock Mínimo es importante - cuando llegues a ese número, el sistema te alertará

---

### ✏️ Editar un Producto

1. En la tabla, busca el producto
2. Haz clic en el ícono del lápiz [✏️]
3. Cambia lo que necesites
4. Guarda los cambios

---

### ➕➖ Aumentar o Disminuir Stock

**Para AGREGAR unidades:**
1. Haz clic en el botón [➕] del producto
2. Ingresa cuántas unidades llegaron
3. Escribe el motivo (ej: "Compra a proveedor")
4. Confirma

**Para QUITAR unidades:**
1. Haz clic en el botón [➖] del producto
2. Ingresa cuántas unidades salieron
3. Escribe el motivo (ej: "Producto dañado")
4. Confirma

> ⚠️ **Importante:** Cuando vendes, el stock se descuenta automáticamente. Estos botones son para ajustes manuales.

---

## 👥 3. Proveedores

Aquí guardas la información de tus proveedores.

### Ver Proveedores

```
┌────────────────────────────────────────────────────┐
│ PROVEEDORES                        [+ Nuevo]       │
├────────────────────────────────────────────────────┤
│                                                    │
│  📋 Ferretería El Tornillo                         │
│     NIT: 900123456-7                               │
│     📞 (601) 555-1234                              │
│     📧 contacto@tornillo.com                       │
│     [Ver Productos] [Editar] [Historial]           │
│                                                    │
│  📋 Distribuidora La Tuerca S.A.                   │
│     NIT: 800987654-3                               │
│     📞 (602) 555-9876                              │
│     📧 ventas@latuerca.com                         │
│     [Ver Productos] [Editar] [Historial]           │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Agregar un Proveedor

1. Clic en **"+ Nuevo Proveedor"**
2. Completa los datos:
   - Nombre de la empresa
   - NIT o identificación
   - Persona de contacto
   - Teléfono
   - Email
   - Dirección
3. Guarda

**¿Para qué sirve?**
- Saber quién te vende cada producto
- Tener los contactos organizados
- Ver el historial de compras

---

## 🧾 4. Facturación - ¡Lo más importante!

Aquí haces las ventas y generas facturas.

### Hacer una Venta (Paso a Paso)

#### Paso 1: Nueva Factura
Haz clic en **"Nueva Factura"**

#### Paso 2: Seleccionar Cliente
```
┌─────────────────────────────────┐
│ Cliente: [Buscar o crear]       │
│                                 │
│ Sugerencias:                    │
│ • María García - CC 123456      │
│ • Juan López - CC 789012        │
│ [+ Crear nuevo cliente]         │
└─────────────────────────────────┘
```

Puedes:
- Buscar un cliente existente
- Crear uno nuevo rápidamente

#### Paso 3: Agregar Productos
```
┌──────────────────────────────────────────────┐
│ Buscar producto: [_________________] [🔍]   │
└──────────────────────────────────────────────┘

PRODUCTOS EN LA FACTURA:
┌────────┬──────────────┬──────┬────────┬────────┐
│ Código │ Producto     │ Cant │ Precio │ Total  │
├────────┼──────────────┼──────┼────────┼────────┤
│ 001    │ Martillo 16oz│  2   │$45,000 │$90,000 │
│ 015    │ Cinta Métrica│  1   │$15,000 │$15,000 │
│        │              │      │        │        │
│        │     [+ Agregar más productos]  │        │
└────────┴──────────────┴──────┴────────┴────────┘
```

Para cada producto:
- Escríbelo en el buscador
- Ajusta la cantidad
- Se calculará el total automáticamente

#### Paso 4: Ver el Resumen
```
┌─────────────────────────────┐
│  RESUMEN DE VENTA           │
├─────────────────────────────┤
│  Subtotal:      $105,000    │
│  Descuento:         $  0    │
│  IVA (19%):      $ 19,950   │
│  ─────────────────────────  │
│  TOTAL:         $124,950    │
└─────────────────────────────┘
```

#### Paso 5: Método de Pago
```
Selecciona cómo pagará:
○ Efectivo
○ Tarjeta
○ Transferencia
○ Crédito
```

#### Paso 6: Confirmar Venta
1. Revisa que todo esté bien
2. Haz clic en **"Confirmar Venta"**
3. Se generará la factura automáticamente

#### Paso 7: Imprimir o Enviar
```
✅ ¡Venta realizada con éxito!
Factura No. 00123

[🖨️ Imprimir]  [📧 Enviar Email]  [💾 Descargar PDF]
```

> 💡 **Tip:** El stock se descuenta automáticamente cuando confirmas la venta

---

### Ver Facturas Anteriores

```
┌────────────────────────────────────────────────────┐
│ HISTORIAL DE FACTURAS            [Nueva Factura]  │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📄 Factura #00123 - 20/Oct/2025                    │
│    Cliente: María García                           │
│    Total: $124,950                                 │
│    Estado: ✅ Pagada                               │
│    [Ver] [Imprimir] [PDF]                          │
│                                                    │
│ 📄 Factura #00122 - 20/Oct/2025                    │
│    Cliente: Pedro Martínez                         │
│    Total: $85,000                                  │
│    Estado: ✅ Pagada                               │
│    [Ver] [Imprimir] [PDF]                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Puedes:**
- Buscar facturas por número, cliente o fecha
- Ver el detalle completo
- Reimprimir facturas
- Descargar en PDF

---

## 👤 5. Clientes

Guarda la información de tus clientes.

### Ver Clientes

```
┌────────────────────────────────────────────────────┐
│ CLIENTES                           [+ Nuevo]       │
├────────────────────────────────────────────────────┤
│                                                    │
│  👤 María García                                   │
│     CC: 1.234.567.890                              │
│     📞 310-555-1234                                │
│     Compras: $2,500,000 (15 facturas)             │
│     Última compra: 20/Oct/2025                     │
│     [Ver Perfil] [Editar]                          │
│                                                    │
│  👤 Pedro Martínez                                 │
│     CC: 9.876.543.210                              │
│     📞 320-555-9876                                │
│     Compras: $1,800,000 (8 facturas)              │
│     Última compra: 18/Oct/2025                     │
│     [Ver Perfil] [Editar]                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Agregar Cliente

```
┌─────────────────────────────────┐
│  NUEVO CLIENTE                  │
├─────────────────────────────────┤
│  Nombre: [_________________]    │
│  Tipo Doc: [▼ Cédula]           │
│  Número: [_________________]    │
│  Teléfono: [_______________]    │
│  Email: [__________________]    │
│  Dirección: [______________]    │
│  Ciudad: [_________________]    │
│                                 │
│  [Cancelar]     [💾 Guardar]    │
└─────────────────────────────────┘
```

**¿Por qué guardar clientes?**
- Facturar más rápido (no escribir todo de nuevo)
- Ver el historial de compras
- Ofrecer crédito a buenos clientes
- Enviar facturas por email

---

## 📈 6. Reportes

Los reportes te ayudan a entender cómo va el negocio.

### Tipos de Reportes Útiles

```
┌────────────────────────────────────────┐
│  ¿QUÉ QUIERES VER?                     │
├────────────────────────────────────────┤
│                                        │
│  💰 VENTAS                             │
│  • Ventas de hoy                       │
│  • Ventas del mes                      │
│  • Productos más vendidos              │
│  • Mejores clientes                    │
│                                        │
│  📦 INVENTARIO                         │
│  • Productos con stock bajo            │
│  • Valor total del inventario          │
│  • Productos que no se venden          │
│                                        │
│  💵 DINERO                             │
│  • Utilidades del mes                  │
│  • Dinero en caja                      │
│  • Cuentas por cobrar                  │
│                                        │
└────────────────────────────────────────┘
```

### Ejemplo: Reporte de Ventas del Mes

```
┌────────────────────────────────────────────────────┐
│  VENTAS DE OCTUBRE 2025                            │
├────────────────────────────────────────────────────┤
│                                                    │
│  Total Vendido: $15,500,000                        │
│  Número de Facturas: 145                           │
│  Ticket Promedio: $106,897                         │
│                                                    │
│  📊 GRÁFICO POR SEMANA:                            │
│  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  │
│                                                    │
│  PRODUCTOS MÁS VENDIDOS:                           │
│  1. Cemento 50kg      - 150 unidades               │
│  2. Varilla 3/8"      - 120 unidades               │
│  3. Tornillos surtidos- 95 paquetes                │
│                                                    │
│  [📄 Exportar PDF] [📊 Exportar Excel]             │
└────────────────────────────────────────────────────┘
```

### Generar un Reporte

1. Selecciona el **tipo de reporte**
2. Elige las **fechas** (desde - hasta)
3. Aplica **filtros** si quieres (categoría, cliente, etc.)
4. Haz clic en **"Generar"**
5. **Descarga** o **imprime** el reporte

---

## ⚙️ 7. Configuración (Solo Administradores)

Aquí configuras el sistema completo.

### Información de tu Empresa

```
┌─────────────────────────────────┐
│  DATOS DE LA EMPRESA            │
├─────────────────────────────────┤
│  Nombre: [___________________]  │
│  NIT: [_____________________]   │
│  Dirección: [_______________]   │
│  Teléfono: [________________]   │
│  Email: [___________________]   │
│  Logo: [📷 Subir imagen]         │
│                                 │
│  [💾 Guardar Cambios]            │
└─────────────────────────────────┘
```

Esto aparecerá en:
- Facturas que imprimas
- Encabezado del sistema
- Reportes

---

### Gestionar Usuarios

Crear usuarios para tu equipo:

```
┌────────────────────────────────────────────────────┐
│ USUARIOS DEL SISTEMA               [+ Nuevo]       │
├────────────────────────────────────────────────────┤
│                                                    │
│  👤 Juan Pérez - Admin                             │
│     Usuario: juanp                                 │
│     📧 juan@ferreteria.com                         │
│     [Editar] [Cambiar Contraseña] [Desactivar]     │
│                                                    │
│  👤 Ana López - Cajero                             │
│     Usuario: anal                                  │
│     📧 ana@ferreteria.com                          │
│     [Editar] [Cambiar Contraseña] [Desactivar]     │
│                                                    │
│  👤 Carlos Gómez - Bodega                          │
│     Usuario: carlosg                               │
│     [Editar] [Cambiar Contraseña] [Desactivar]     │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Para crear un usuario nuevo:**
1. Clic en **"+ Nuevo Usuario"**
2. Completa:
   - Nombre completo
   - Usuario (para entrar al sistema)
   - Email
   - Contraseña inicial
   - Rol (Admin, Cajero o Bodega)
3. Guarda

> ⚠️ **Importante:** La persona deberá cambiar su contraseña la primera vez que entre

---

### Categorías de Productos

Organiza tus productos por tipo:

```
CATEGORÍAS ACTUALES:
• Herramientas
• Materiales de Construcción
• Pinturas
• Electricidad
• Plomería
• Ferretería General

[+ Agregar Categoría]
```

Esto te ayuda a:
- Encontrar productos más rápido
- Hacer reportes por categoría
- Organizar mejor el inventario

---

### Configuración de Facturación

```
┌─────────────────────────────────┐
│  CONFIGURACIÓN DE FACTURAS      │
├─────────────────────────────────┤
│  Prefijo: [FE-]                 │
│  Próximo número: [00124]        │
│                                 │
│  IVA: [19] %                    │
│                                 │
│  Métodos de Pago:               │
│  ☑ Efectivo                     │
│  ☑ Tarjeta                      │
│  ☑ Transferencia                │
│  ☑ Crédito                      │
│                                 │
│  [💾 Guardar Cambios]            │
└─────────────────────────────────┘
```

---

## 🆘 Problemas Comunes y Soluciones

### ❌ No puedo entrar al sistema

**Posibles causas:**
- Usuario o contraseña incorrectos
- Tu cuenta está desactivada
- Problemas de conexión

**Solución:**
1. Verifica que escribiste bien usuario y contraseña
2. Contacta al administrador del sistema
3. Verifica tu conexión a internet

---

### ❌ No veo una sección del menú

**Causa:**
Tu rol no tiene permiso para ver esa sección.

**Ejemplo:**
- Si eres Cajero, NO verás Configuración
- Si eres Bodega, NO verás Facturación

**Solución:**
Si necesitas acceso, pídele al administrador que cambie tu rol.

---

### ❌ No aparece un producto en el buscador

**Posibles causas:**
- El producto está inactivo
- El producto no existe
- Error al escribir el nombre

**Solución:**
1. Ve a Inventario
2. Busca el producto allí
3. Verifica que esté "Activo"
4. Si no existe, agrégalo

---

### ❌ Error al confirmar una venta

**Posibles causas:**
- No hay stock suficiente
- Problemas de conexión
- Datos incompletos

**Solución:**
1. Verifica el stock del producto
2. Completa todos los datos del cliente
3. Intenta de nuevo
4. Si persiste, contacta soporte

---

### ❌ No se imprime la factura

**Solución:**
1. Verifica que tu impresora esté encendida
2. Descarga el PDF y ábrelo
3. Imprime el PDF manualmente
4. Verifica los permisos del navegador

---

## 💡 Consejos y Mejores Prácticas

### ✅ Para Cajeros

1. **Al inicio del día:**
   - Abre caja con el dinero inicial
   - Verifica que la impresora funcione

2. **Durante las ventas:**
   - Siempre confirma el precio antes de cobrar
   - Verifica el stock antes de vender
   - Pregunta si el cliente tiene cuenta registrada

3. **Al cerrar:**
   - Cierra la caja al final del día
   - Cuadra el dinero físico con el sistema
   - Reporta cualquier diferencia

### ✅ Para Personal de Bodega

1. **Al recibir productos:**
   - Usa el botón [➕] para aumentar stock
   - Anota siempre el motivo (ej: "Compra proveedor X")
   - Verifica que coincida con la factura de compra

2. **Control de inventario:**
   - Revisa diariamente las alertas de stock bajo
   - Informa al administrador sobre productos dañados
   - Mantén actualizada la ubicación de productos

### ✅ Para Administradores

1. **Seguridad:**
   - Cambia tu contraseña periódicamente
   - No compartas tu usuario con nadie
   - Revisa los usuarios activos regularmente

2. **Mantenimiento:**
   - Revisa los reportes semanalmente
   - Actualiza precios cuando sea necesario
   - Limpia productos inactivos periódicamente

3. **Respaldo:**
   - Descarga respaldos mensuales
   - Guarda los PDF de facturas importantes
   - Exporta reportes financieros

---

## 📱 Acceso desde Celular o Tablet

El sistema funciona en cualquier dispositivo:

### 📱 Teléfono Móvil
```
┌──────────────┐
│ [☰]  Sistema │ ← Menú hamburguesa
├──────────────┤
│              │
│   Contenido  │
│   adaptado   │
│   al tamaño  │
│   de móvil   │
│              │
└──────────────┘
```

### 📱 Tablet
La interfaz se adapta para mostrar más información.

**Ventajas:**
- Factura desde cualquier lugar
- Consulta inventario en la bodega
- Atiende clientes sin estar en el mostrador

---

## 🔐 Seguridad y Privacidad

### Protege tu cuenta

1. **Contraseña segura:**
   - Mínimo 8 caracteres
   - Usa números y letras
   - No uses tu nombre o fecha de nacimiento

2. **Cierra sesión:**
   - Siempre cierra sesión cuando termines
   - Especialmente en computadoras compartidas

3. **Mantén privada tu información:**
   - No compartas tu usuario
   - No dejes la sesión abierta sin supervisión

---

## 📞 Contacto y Soporte

### ¿Necesitas ayuda?

1. **Primero:** Revisa esta guía
2. **Luego:** Pregunta a tu administrador del sistema
3. **Si persiste:** Contacta a soporte técnico

### Reportar un problema

Cuando reportes un problema, ten a mano:
- Tu usuario (sin contraseña)
- Qué estabas haciendo
- Mensaje de error (si aparece)
- Captura de pantalla (si es posible)

---

## ✨ Actualizaciones

El sistema se mejora constantemente:
- Nuevas funciones
- Corrección de errores
- Mejoras de velocidad

**No requiere acción de tu parte** - las actualizaciones son automáticas.

---

## 🎓 Video Tutoriales

> 💡 **Próximamente:** Videos paso a paso de cada funcionalidad

Temas a cubrir:
- ✅ Cómo hacer tu primera venta
- ✅ Cómo agregar productos al inventario
- ✅ Cómo generar reportes
- ✅ Configuración inicial del sistema

---

## ✅ Lista de Verificación Diaria

### Para Cajeros:
- [ ] Abrir caja con dinero inicial
- [ ] Verificar impresora
- [ ] Revisar productos con stock bajo
- [ ] Realizar ventas del día
- [ ] Cerrar caja al finalizar
- [ ] Reportar diferencias (si las hay)

### Para Bodega:
- [ ] Revisar alertas de stock
- [ ] Actualizar llegada de productos
- [ ] Verificar productos próximos a vencer
- [ ] Organizar ubicaciones
- [ ] Reportar productos dañados

### Para Administradores:
- [ ] Revisar ventas del día anterior
- [ ] Verificar cierres de caja
- [ ] Revisar alertas importantes
- [ ] Responder consultas del equipo
- [ ] Actualizar precios (si es necesario)

---

## 🎯 Resumen de Botones Importantes

| Botón | Qué hace |
|-------|----------|
| **[+ Nuevo]** | Crea algo nuevo (producto, cliente, etc.) |
| **[✏️]** | Edita información existente |
| **[🗑️]** | Elimina o desactiva |
| **[➕]** | Aumenta stock de un producto |
| **[➖]** | Disminuye stock de un producto |
| **[💾 Guardar]** | Guarda cambios |
| **[❌ Cancelar]** | Cancela sin guardar |
| **[🔍]** | Busca información |
| **[🖨️]** | Imprime |
| **[📄 PDF]** | Descarga en PDF |
| **[Salir]** | Cierra tu sesión |

---

## 🏁 Conclusión

Este sistema está diseñado para hacer tu trabajo más fácil:

✅ Ventas más rápidas
✅ Control total del inventario
✅ Clientes organizados
✅ Reportes en segundos
✅ Menos errores

**Recuerda:**
- Practica hace al maestro
- Si tienes dudas, pregunta
- El sistema está aquí para ayudarte

---

## 📚 Glosario de Términos

- **Stock:** Cantidad de productos disponibles
- **SKU/Código:** Identificador único de un producto
- **Factura:** Documento de venta
- **Ticket:** Venta individual
- **Dashboard:** Pantalla principal de resumen
- **Proveedor:** Empresa que te vende productos
- **Cliente:** Persona que te compra
- **IVA:** Impuesto sobre las ventas (19% en Colombia)
- **Rol:** Tipo de usuario (Admin, Cajero, Bodega)

---

**📅 Versión:** 1.0 - Guía Simplificada
**🏪 Sistema:** Ferretería Pro
**👥 Para:** Todos los usuarios

¡Éxito en tu trabajo diario! 🎉
