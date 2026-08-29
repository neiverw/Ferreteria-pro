# Documentación de la API - Ferretería Pro (SGI)

Esta documentación describe los endpoints internos de la API REST disponibles en el sistema **Ferretería Pro**, incluyendo sus métodos, parámetros, requerimientos de autenticación y ejemplos de respuesta.

---

## 🔐 Autenticación y Autorización

Todas las peticiones protegidas requieren una sesión activa autenticada mediante cookies de sesión de Supabase Auth generadas al iniciar sesión en el cliente.

### Roles de Usuario
- **`admin`**: Acceso total al sistema, gestión de usuarios y configuraciones globales.
- **`cajero`**: Acceso a ventas, facturación, clientes e inventario.
- **`bodega`**: Acceso a consulta y gestión de inventario y reportes.

### Códigos de Estado HTTP
- `200 OK`: Petición exitosa.
- `201 Created`: Recurso creado exitosamente.
- `400 Bad Request`: Parámetros o cuerpo de la petición inválidos.
- `401 Unauthorized`: Usuario no autenticado o sesión expirada.
- `403 Forbidden`: Usuario autenticado pero sin permisos para la acción (p. ej. requiere rol `admin`).
- `500 Internal Server Error`: Error inesperado en el servidor o en la base de datos.

---

## ⚙️ 1. Configuración del Sistema (`/api/system-settings`)

### `GET /api/system-settings`
Obtiene las variables de configuración empresarial del sistema.

- **Nivel de Acceso**: Autenticado (`admin`, `cajero`, `bodega`).
- **Respuesta `200 OK`**:
```json
{
  "settings": {
    "company_name": "Ferretería Pro",
    "company_nit": "900123456-7",
    "company_address": "Calle 10 # 20-30",
    "company_phone": "3128807356",
    "company_email": "contacto@ferreteriapro.com",
    "default_tax_rate": "19"
  }
}
```

### `POST /api/system-settings`
Actualiza una o varias variables de configuración del sistema.

- **Nivel de Acceso**: Administrador (`admin`).
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "settings": {
    "company_name": "Ferretería Pro Principal",
    "company_phone": "3001234567",
    "default_tax_rate": "19.0"
  }
}
```
- **Respuesta `200 OK`**:
```json
{
  "success": true,
  "message": "Configuración actualizada exitosamente"
}
```

---

## 🎨 2. Preferencias de Usuario (`/api/user-preferences`)

### `GET /api/user-preferences`
Obtiene las preferencias de interfaz (tema visual y tamaño de fuente) del usuario que realiza la petición.

- **Nivel de Acceso**: Autenticado.
- **Respuesta `200 OK`**:
```json
{
  "preferences": {
    "theme": "light",
    "fontSize": "medium"
  }
}
```

### `POST /api/user-preferences`
Actualiza las preferencias de interfaz del usuario autenticado.

- **Nivel de Acceso**: Autenticado.
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "preferences": {
    "theme": "dark",
    "fontSize": "large"
  }
}
```
- **Respuesta `200 OK`**:
```json
{
  "message": "Preferencias actualizadas exitosamente",
  "preferences": {
    "theme": "dark",
    "fontSize": "large"
  }
}
```

---

## 👥 3. Gestión de Usuarios (`/api/*`)

### `GET /api/list-users`
Retorna la lista de todos los usuarios registrados y sus roles en el sistema.

- **Nivel de Acceso**: Administrador (`admin`).
- **Respuesta `200 OK`**:
```json
{
  "users": [
    {
      "user_id": "8b51d5c2-1234-4567-89ab-cdef01234567",
      "username": "admin",
      "name": "Administrador Principal",
      "email": "admin@ferreteria.com",
      "role": "admin"
    }
  ]
}
```

### `POST /api/create-user`
Crea una nueva cuenta de usuario en Supabase Auth y su respectivo registro en la tabla `profiles`.

- **Nivel de Acceso**: Administrador (`admin`).
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "cajero1@ferreteria.com",
  "password": "PasswordSeguro123!",
  "username": "cajero1",
  "name": "Carlos Pérez",
  "role": "cajero"
}
```
- **Respuesta `201 Created`**:
```json
{
  "message": "Usuario creado.",
  "user_id": "8b51d5c2-1234-4567-89ab-cdef01234567"
}
```

### `DELETE /api/delete-user`
Elimina un usuario del sistema (Auth y perfil asociado). Un usuario no puede auto-eliminarse.

- **Nivel de Acceso**: Administrador (`admin`).
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "userIdToDelete": "8b51d5c2-1234-4567-89ab-cdef01234567"
}
```
- **Respuesta `200 OK`**:
```json
{
  "message": "Usuario eliminado."
}
```

### `POST /api/admin/update-password`
Permite a un administrador cambiar la contraseña de acceso de cualquier usuario.

- **Nivel de Acceso**: Administrador (`admin`).
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "userId": "8b51d5c2-1234-4567-89ab-cdef01234567",
  "newPassword": "NuevaPassword2026!"
}
```
- **Respuesta `200 OK`**:
```json
{
  "ok": true,
  "user": {
    "id": "8b51d5c2-1234-4567-89ab-cdef01234567",
    "email": "cajero1@ferreteria.com"
  }
}
```

---

## 📦 4. Proveedores (`/api/suppliers`)

### `GET /api/suppliers`
Lista todos los proveedores registrados ordenados por fecha de creación descendente.

- **Nivel de Acceso**: Autenticado.
- **Respuesta `200 OK`**:
```json
[
  {
    "id": "1",
    "name": "Distribuidora Eléctrica S.A.S",
    "contact_name": "Juan Gómez",
    "phone": "3101234567",
    "email": "ventas@distribuidora.com",
    "address": "Av. 30 # 45-67",
    "created_at": "2026-01-15T10:00:00.000Z"
  }
]
```

### `POST /api/suppliers`
Registra un nuevo proveedor en la base de datos.

- **Nivel de Acceso**: Autenticado.
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Herramientas del Valle",
  "contact_name": "María Rodríguez",
  "phone": "3159876543",
  "email": "contacto@herramientasvalle.com",
  "address": "Carrera 5 # 12-34"
}
```
- **Respuesta `201 Created`**:
```json
{
  "id": "2",
  "name": "Herramientas del Valle",
  "contact_name": "María Rodríguez",
  "phone": "3159876543",
  "email": "contacto@herramientasvalle.com",
  "address": "Carrera 5 # 12-34",
  "created_at": "2026-08-29T16:00:00.000Z"
}
```

### `PUT /api/suppliers/[id]`
Actualiza los datos de un proveedor específico según su ID.

- **Nivel de Acceso**: Autenticado.
- **Parámetro de ruta**: `id` (Identificador del proveedor).
- **Body**:
```json
{
  "name": "Herramientas del Valle S.A.S",
  "contact_name": "María Rodríguez",
  "phone": "3159876543",
  "email": "info@herramientasvalle.com",
  "address": "Carrera 5 # 12-34"
}
```
- **Respuesta `200 OK`**:
```json
{
  "id": "2",
  "name": "Herramientas del Valle S.A.S",
  "contact_name": "María Rodríguez",
  "phone": "3159876543",
  "email": "info@herramientasvalle.com",
  "address": "Carrera 5 # 12-34",
  "updated_at": "2026-08-29T16:15:00.000Z"
}
```

### `DELETE /api/suppliers/[id]`
Elimina un proveedor por su ID.

- **Nivel de Acceso**: Autenticado.
- **Parámetro de ruta**: `id` (Identificador del proveedor).
- **Respuesta `200 OK`**:
```json
{
  "ok": true
}
```

### `GET /api/suppliers/[id]/products`
Lista todos los productos asociados al catálogo de un proveedor específico.

- **Nivel de Acceso**: Autenticado.
- **Parámetro de ruta**: `id` (Identificador del proveedor).
- **Respuesta `200 OK`**:
```json
[
  {
    "id": "prod-101",
    "code": "MART-01",
    "name": "Martillo Tubular 16oz",
    "description": "Martillo con mango de goma antideslizante",
    "brand": "Stanley",
    "stock": 25,
    "price": 35000,
    "cost": 22000,
    "created_at": "2026-02-10T14:30:00.000Z"
  }
]
```

---

## 🩺 5. Diagnóstico (`/api/test`)

### `GET /api/test`
Comprueba la disponibilidad del servidor de API.

- **Nivel de Acceso**: Público.
- **Respuesta `200 OK`**:
```json
{
  "ok": true
}
```
