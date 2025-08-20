# Sistema de Autenticación y Autorización

## Resumen

Se ha implementado un sistema completo de autenticación y autorización para proteger todas las rutas de la API.

## Componentes Implementados

### 1. Middleware de Autenticación (`src/middleware/auth.js`)

- **`requireAuth`**: Middleware que verifica que el usuario esté autenticado
- **`optionalAuth`**: Middleware opcional que agrega información del usuario si está autenticado

### 2. Middleware de Permisos (`src/middleware/permissions.js`)

- **`checkPermission`**: Verifica un permiso específico
- **`checkAnyPermission`**: Verifica que el usuario tenga al menos uno de varios permisos (OR)
- **`checkAllPermissions`**: Verifica que el usuario tenga todos los permisos requeridos (AND)

### 3. Configuración de Autenticación (`src/config/auth.js`)

- Configuración centralizada para JWT, bloqueo de cuentas y políticas de contraseñas
- Variables de entorno para personalización

### 4. Manejo de Errores (`src/middleware/errorHandler.js`)

- Manejo centralizado de errores de autenticación y autorización
- Respuestas consistentes para diferentes tipos de errores

## Rutas Protegidas

Todas las siguientes rutas requieren autenticación:

- `/api/business-client-types/*`
- `/api/countries/*`
- `/api/cities/*`
- `/api/business-client-registration/*`
- `/api/role-types/*`
- `/api/persons/*`
- `/api/offices/*`
- `/api/office-types/*`
- `/api/roles/*`
- `/api/permissions/*`
- `/api/users/*`

**Excepción**: `/api/auth/*` (rutas de autenticación)

## Cómo Funciona

### 1. Login
1. Usuario envía credenciales a `/api/auth/login`
2. Sistema verifica credenciales y genera token JWT
3. Token incluye información del usuario, rol y permisos

### 2. Acceso a Rutas Protegidas
1. Cliente incluye token en header: `Authorization: Bearer <token>`
2. Middleware `requireAuth` verifica el token
3. Si es válido, agrega información del usuario a `req.user`
4. Si no es válido, retorna error 401

### 3. Verificación de Permisos
1. Usar middleware de permisos en rutas específicas
2. Ejemplo: `checkPermission('CREATE_USER')`
3. Sistema verifica que el usuario tenga el permiso requerido

## Uso en el Frontend

### Servicio Base (`ApiService`)
- Maneja automáticamente la autenticación
- Incluye token en todas las peticiones
- Redirige al login si el token expira

### Servicios Específicos
- Todos los servicios ahora usan `ApiService`
- Autenticación transparente para el desarrollador
- Manejo automático de errores de autenticación

## Variables de Entorno

Crear archivo `.env` con:

```env
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=1h
MAX_LOGIN_ATTEMPTS=5
BLOCK_DURATION_MINUTES=15
```

## Seguridad

- **JWT**: Tokens firmados y con expiración
- **Rate Limiting**: Bloqueo por intentos fallidos de login
- **Headers**: Verificación estricta de headers de autorización
- **Errores**: No se exponen información sensible en errores

## Próximos Pasos

1. Implementar refresh tokens
2. Agregar rate limiting global
3. Implementar auditoría de accesos
4. Agregar validación de contraseñas robusta
5. Implementar 2FA (autenticación de dos factores)
