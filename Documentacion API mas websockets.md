Claro, aquí tienes la documentación completa y detallada de la API en formato Markdown, elaborada a partir del código fuente que proporcionaste.

-----

# Documentación de la API

Esta API está diseñada para gestionar una aplicación de afiliados, incluyendo sus datos, contribuciones, multas y asistencia. Está construida con **NestJS** y utiliza **TypeORM** para la interacción con la base de datos PostgreSQL. Además, implementa un sistema de **WebSockets** para notificaciones en tiempo real y un endpoint de **sincronización** para soportar funcionalidades offline en el cliente (probablemente una aplicación Flutter).

## Arquitectura General

La API sigue una arquitectura modular, donde cada recurso principal (afiliados, usuarios, etc.) tiene su propio módulo de NestJS. Cada módulo contiene:

  * **Controller**: Expone los endpoints HTTP.
  * **Service**: Contiene la lógica de negocio.
  * **Entity**: Define la estructura de la tabla en la base de datos.
  * **DTO (Data Transfer Objects)**: Define la estructura de los datos para las peticiones (request) y respuestas (response).
  * **Module**: Agrupa todos los componentes anteriores.

-----

## WebSockets para Notificaciones en Tiempo Real

La API utiliza WebSockets para notificar a los clientes conectados sobre cambios en los datos. Esto es ideal para aplicaciones que necesitan mantener la información actualizada en múltiples dispositivos sin necesidad de recargar.

El `EventsGateway` es el componente central que maneja las conexiones de WebSocket.

### Funcionamiento

1.  **Conexión**: Un cliente (la app de Flutter) establece una conexión WebSocket con el servidor.
2.  **Emisión de Eventos**: Cuando se realiza una operación de escritura (crear, actualizar, eliminar) en un servicio, este llama al método `emitChange` del `EventsGateway`.
3.  **Recepción de Eventos**: El `EventsGateway` emite un evento a todos los clientes conectados. El cliente puede escuchar estos eventos y actuar en consecuencia (por ejemplo, volver a solicitar los datos actualizados o actualizar la UI).

### Eventos Habilitados

| Evento | Origen del Cambio | Payload (Datos enviados) |
| --- | --- | --- |
| `affiliatesChanged` | Afiliados (creado/actualizado/eliminado) | `{ "message": "string", "uuid": "string" }` |
| `usersChanged` | Usuarios (creado/actualizado/eliminado) | `{ "message": "string", "uuid": "string" }` |
| `finesChanged` | Multas (creada/actualizada/eliminada) | `{ "message": "string", "uuid": "string" }` |
| `contributionsChanged` | Contribuciones (creada/actualizada/eliminada) | `{ "message": "string", "uuid": "string" }` |
| `attendanceChanged` | Asistencia (creada/actualizada/eliminada) | `{ "message": "string", "uuid": "string" }` |
| `configurationChanged` | Configuración (actualizada) | `{ "message": "string" }` |

-----

## Sincronización para Operación Offline (`/api/sync`)

Este es un endpoint crucial para permitir que la aplicación cliente funcione sin conexión a internet y sincronice los datos cuando recupere la conexión.

### `GET /api/sync/pull`

Este endpoint permite al cliente "jalar" (pull) todos los cambios que han ocurrido en el servidor desde la última sincronización.

#### Parámetros de Query

  * `lastSync` (opcional): Un timestamp en formato ISO 8601 que representa la última vez que el cliente se sincronizó.
      * Si se proporciona, el servidor devolverá solo las entidades que han sido creadas o actualizadas *después* de esta fecha.
      * Si no se proporciona, el servidor devolverá *todos* los datos de todas las entidades.

#### Respuesta

La respuesta es un objeto JSON que contiene arrays de todas las entidades del sistema:

```json
{
  "affiliates": [...],
  "users": [...],
  "fines": [...],
  "contributions": [...],
  "attendance": [...],
  "configuration": [...]
}
```

-----

## Endpoints de la API por Módulo

### Módulo de Afiliados (`/api/affiliates`)

Gestiona la información de los afiliados.

  * `GET /`: Retorna un array con todos los afiliados.
  * `GET /:uuid`: Retorna un afiliado específico por su `uuid`.
  * `POST /`: Crea un nuevo afiliado. Si ya existe un afiliado con el mismo `uuid`, lo actualiza (lógica de `upsert`).
  * `PUT /:uuid` y `PATCH /:uuid`: Actualizan un afiliado existente.
  * `DELETE /:uuid`: Elimina un afiliado.

**Cuerpo de la Petición (DTO: `CreateAffiliateDto`)**

```json
{
  "uuid": "string (UUID)",
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "ci": "string",
  "phone": "string (opcional)",
  "original_affiliate_name": "string (opcional)",
  "current_affiliate_name": "string (opcional)",
  "profile_photo_url": "string (URL, opcional)",
  "credential_photo_url": "string (URL, opcional)",
  "tags": "string (opcional)",
  "total_paid": "number (opcional)",
  "total_debt": "number (opcional)"
}
```

### Módulo de Usuarios (`/api/users`)

Gestiona los usuarios que pueden acceder al sistema.

  * `GET /`: Retorna un array con todos los usuarios.
  * `POST /`: Crea o actualiza un usuario (lógica de `upsert`).
  * `PUT /:uuid` y `PATCH /:uuid`: Actualizan un usuario existente.
  * `DELETE /:uuid`: Elimina un usuario.

**Cuerpo de la Petición (DTO: `CreateUserDto`)**

```json
{
  "uuid": "string (UUID)",
  "user_name": "string",
  "password_hash": "string",
  "email": "string (email)",
  "role": "string"
}
```

### Módulo de Multas (`/api/fines`)

Gestiona las multas asociadas a los afiliados.

  * `GET /`: Retorna un array con todas las multas y la información del afiliado relacionado.
  * `GET /by-affiliate/:affiliateId`: Retorna todas las multas de un afiliado específico.
  * `POST /`: Crea o actualiza una multa (lógica de `upsert`).
  * `PUT /:uuid` y `PATCH /:uuid`: Actualizan una multa existente.
  * `DELETE /:uuid`: Elimina una multa.

**Cuerpo de la Petición (DTO: `CreateFineDto`)**

```json
{
  "uuid": "string (UUID)",
  "description": "string",
  "amount": "number",
  "amount_paid": "number (opcional)",
  "date": "string (ISO 8601)",
  "is_paid": "boolean (opcional)",
  "category": "string",
  "affiliate_uuid": "string (UUID)",
  "related_attendance_uuid": "string (UUID, opcional)"
}
```

### Módulo de Contribuciones (`/api/contributions`)

Gestiona las contribuciones o cuotas, que pueden ser generales o específicas para ciertos afiliados.

  * `GET /`: Retorna todas las contribuciones, incluyendo los enlaces a los afiliados y los detalles de pago de cada uno.
  * `GET /:uuid`: Retorna una contribución específica con todos sus detalles.
  * `POST /`: Crea una nueva contribución y sus enlaces iniciales a los afiliados.
  * `PATCH /link/:uuid`: Endpoint especial para actualizar el estado de un pago individual de un afiliado a una contribución (ej. registrar un pago).
  * `DELETE /:uuid`: Elimina una contribución y todos sus enlaces de pago asociados.

**Cuerpo de la Petición para Crear (DTO: `CreateContributionDto`)**

```json
{
  "uuid": "string (UUID)",
  "name": "string",
  "date": "string (ISO 8601)",
  "default_amount": "number",
  "links": [
    {
      "uuid": "string (UUID)",
      "affiliate_uuid": "string (UUID)",
      "amount_to_pay": "number"
    }
  ]
}
```

### Módulo de Asistencia (`/api/attendance`)

Gestiona las listas de asistencia y los registros individuales (`PRESENTE`, `RETRASO`, etc.).

  * `GET /`: Retorna todas las listas de asistencia con sus respectivos registros.
  * `POST /`: Crea o actualiza una lista de asistencia completa, incluyendo todos sus registros. Esto permite enviar un "paquete" de datos de asistencia de una sola vez.
  * `DELETE /:uuid`: Elimina una lista de asistencia y todos sus registros.

**Cuerpo de la Petición (DTO: `CreateAttendanceDto`)**

```json
{
  "uuid": "string (UUID)",
  "name": "string",
  "status": "string",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)",
  "records": [
    {
      "uuid": "string (UUID)",
      "affiliate_uuid": "string (UUID)",
      "status": "string",
      "registered_at": "string (ISO 8601)"
    }
  ]
}
```

### Módulo de Configuración (`/api/configuration`)

Gestiona la configuración global de la aplicación.

  * `GET /`: Retorna el objeto de configuración actual. Si no existe, crea y retorna uno por defecto.
  * `PATCH /`: Actualiza la configuración.

**Cuerpo de la Petición (DTO: `UpdateConfigurationDto`)**

```json
{
  "monto_multa_retraso": "number (opcional)",
  "monto_multa_falta": "number (opcional)",
  "backend_url": "string (opcional)"
}
```