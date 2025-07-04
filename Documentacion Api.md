
# Documentación de la API del Backend

Esta documentación describe todos los endpoints de la API, sus funcionalidades, las estructuras de datos esperadas y las posibles respuestas.

## Conceptos Generales

### Soft Delete (Borrado Lógico)

La API utiliza una estrategia de **borrado lógico** (`soft delete`) en lugar de eliminar permanentemente los registros de la base de datos. Cuando se solicita la eliminación de un recurso (como un afiliado o un usuario), en lugar de borrar la fila, se establece una marca de tiempo en la columna `deleted_at`.

Esto significa que:

  - Los registros "eliminados" se conservan en la base de datos para mantener la integridad histórica.
  - Las consultas de obtención (`GET`) por defecto solo devuelven los registros que **no han sido eliminados** (donde `deleted_at` es `NULL`).
  - La validación de campos únicos (como el `id` o `ci` del afiliado) se realiza únicamente contra los registros activos.

### WebSockets para Notificaciones en Tiempo Real

El backend integra un servidor de **WebSockets** para notificar a los clientes conectados sobre cambios en los datos. Esto es útil para que las aplicaciones cliente (como una app móvil) actualicen su estado sin necesidad de realizar consultas constantes a la API.

Los eventos principales son:

  - `affiliatesChanged`
  - `usersChanged`
  - `finesChanged`
  - `contributionsChanged`
  - `attendanceChanged`
  - `configurationChanged`

Cada evento envía un objeto que generalmente contiene un `message` y el `uuid` del recurso afectado.

-----

## Módulo de Sincronización

Este módulo está diseñado para que los clientes puedan sincronizar sus datos locales con el servidor de manera eficiente.

### `GET /api/sync/pull`

Obtiene todos los cambios (registros actualizados y eliminados) ocurridos desde la última sincronización.

  - **Descripción**: Es el endpoint principal para la sincronización "pull". El cliente puede enviar una marca de tiempo opcional para recibir solo los cambios ocurridos desde esa fecha.
  - **Parámetros de Consulta (Query Params)**:
      - `lastSync` (opcional): Una cadena de texto con la fecha y hora en formato ISO 8601 de la última sincronización.
  - **Respuesta Exitosa (200 OK)**:
    Un objeto JSON que contiene las listas de registros actualizados y los UUIDs de los registros eliminados para cada módulo.
    ```json
    {
      "affiliates": {
        "updated": [
          {
            "uuid": "...",
            "id": "AP-001",
            "first_name": "Juan",
            ...
          }
        ],
        "deleted": ["uuid-del-1", "uuid-del-2"]
      },
      "users": { ... },
      "fines": { ... },
      "contributions": { ... },
      "attendance": { ... },
      "configuration": [
        {
          "id": 1,
          "monto_multa_retraso": 5.0,
          ...
        }
      ]
    }
    ```

-----

## Módulo de Afiliados (`/api/affiliates`)

Gestiona toda la información relacionada con los afiliados.

### `POST /api/affiliates`

Crea un nuevo afiliado o actualiza uno existente si ya existe un registro con el mismo `uuid`. Este comportamiento se conoce como **"upsert"**.

  - **Descripción**: La lógica de servicio valida que el `id` y `ci` no estén en uso por otro afiliado activo.
  - **Cuerpo de la Petición (`Request Body`)**:
    ```json
    {
      "uuid": "c3e8a4f0-3b1a-4b3a-8c1a-9a0a1a2b3c4d",
      "id": "AP-050",
      "first_name": "Ana",
      "last_name": "Gomez",
      "ci": "1234567",
      "phone": "77712345",
      "original_affiliate_name": "-",
      "current_affiliate_name": "-",
      "profile_photo_url": "https://example.com/photo.jpg",
      "credential_photo_url": "https://example.com/cred.jpg",
      "tags": "[]",
      "total_paid": 100.0,
      "total_debt": 50.0
    }
    ```
  - **Respuesta Exitosa (200 OK)**: Devuelve el objeto del afiliado creado o actualizado.
  - **Posibles Errores**:
      - `400 Bad Request`: Si los datos enviados no cumplen con las validaciones (ej. falta un campo obligatorio).
      - `409 Conflict`: Si el `id` o `ci` ya está en uso por otro afiliado activo.

### `PUT /api/affiliates/:uuid` o `PATCH /api/affiliates/:uuid`

Actualiza la información de un afiliado. La lógica es la misma que el `POST`.

  - **Descripción**: Aunque la ruta incluye un `uuid`, el servicio se basa en el `uuid` del cuerpo de la petición para realizar el "upsert".
  - **Cuerpo de la Petición (`Request Body`)**: El mismo que para el `POST`.
  - **Respuesta Exitosa (200 OK)**: Devuelve el objeto del afiliado actualizado.

### `GET /api/affiliates`

Obtiene una lista de todos los afiliados activos.

  - **Respuesta Exitosa (200 OK)**: Un array de objetos de afiliados.
    ```json
    [
      {
        "uuid": "...",
        "id": "AP-001",
        ...
      }
    ]
    ```

### `GET /api/affiliates/:uuid`

Obtiene un afiliado específico por su UUID.

  - **Respuesta Exitosa (200 OK)**: El objeto del afiliado encontrado.
  - **Posibles Errores**:
      - `404 Not Found`: Si no se encuentra ningún afiliado activo con el UUID proporcionado.

### `DELETE /api/affiliates/:uuid`

Realiza un borrado lógico de un afiliado.

  - **Respuesta Exitosa (204 No Content)**: Indica que la operación se realizó con éxito.
  - **Posibles Errores**:
      - `404 Not Found`: Si el afiliado no existe.

-----

## Módulo de Usuarios (`/api/users`)

Gestiona los usuarios que pueden acceder al sistema.

### `POST /api/users`

Crea o actualiza un usuario (upsert).

  - **Descripción**: Valida que el `user_name` y el `email` no estén en uso por otro usuario activo.
  - **Cuerpo de la Petición (`Request Body`)**:
    ```json
    {
      "uuid": "d4e9b5f1-4c2b-5d4b-9d2b-1a2b3c4d5e6f",
      "user_name": "admin_juan",
      "password_hash": "un_hash_seguro_aqui",
      "email": "juan@example.com",
      "role": "admin"
    }
    ```
  - **Respuesta Exitosa (200 OK)**: El objeto del usuario creado/actualizado.
  - **Posibles Errores**:
      - `409 Conflict`: Si el `user_name` o `email` ya existen.

### `PUT /api/users/:uuid` o `PATCH /api/users/:uuid`

Actualiza un usuario.

  - **Cuerpo de la Petición (`Request Body`)**: Puede ser un objeto parcial con los campos a actualizar.
  - **Respuesta Exitosa (200 OK)**: El objeto del usuario actualizado.
  - **Posibles Errores**:
      - `404 Not Found`: Si el usuario no existe.

### `GET /api/users`

Obtiene una lista de todos los usuarios activos.

### `DELETE /api/users/:uuid`

Realiza un borrado lógico de un usuario.

  - **Respuesta Exitosa (204 No Content)**.
  - **Posibles Errores**:
      - `404 Not Found`.

-----

## Módulo de Multas (`/api/fines`)

Gestiona las multas asociadas a los afiliados.

### `POST /api/fines`

Crea o actualiza una multa (upsert).

  - **Cuerpo de la Petición (`Request Body`)**:
    ```json
    {
      "uuid": "e5f0c6a2-5d3c-6e5c-ad3c-2b3d4e5f6a7b",
      "description": "Multa por retraso en reunión",
      "amount": 10.50,
      "amount_paid": 0,
      "date": "2025-07-02T10:10:00.000Z",
      "is_paid": false,
      "category": "Retraso",
      "affiliate_uuid": "c3e8a4f0-...",
      "related_attendance_uuid": "a1b2c3d4-..."
    }
    ```
  - **Respuesta Exitosa (200 OK)**: El objeto de la multa creada/actualizada.

### `PUT /api/fines/:uuid` o `PATCH /api/fines/:uuid`

Actualiza una multa existente.

  - **Cuerpo de la Petición (`Request Body`)**: Objeto parcial con los campos a actualizar.
  - **Respuesta Exitosa (200 OK)**: El objeto de la multa actualizado.
  - **Posibles Errores**:
      - `404 Not Found`.

### `GET /api/fines`

Obtiene todas las multas.

### `GET /api/fines/by-affiliate/:affiliateId`

Obtiene todas las multas de un afiliado específico.

### `DELETE /api/fines/:uuid`

Realiza un borrado lógico de una multa.

  - **Respuesta Exitosa (204 No Content)**.
  - **Posibles Errores**:
      - `404 Not Found`.

-----

## Módulo de Contribuciones (`/api/contributions`)

Gestiona las contribuciones o aportes.

### `POST /api/contributions`

Crea una nueva contribución y sus enlaces con los afiliados.

  - **Cuerpo de la Petición (`Request Body`)**:
    ```json
    {
      "uuid": "f6g1d7b3-6e4d-7f6d-be4d-3c4e5f6a7b8c",
      "name": "Aporte pro-sede",
      "date": "2025-08-01T12:00:00.000Z",
      "default_amount": 50.0,
      "links": [
        {
          "uuid": "l1-uuid",
          "affiliate_uuid": "c3e8a4f0-...",
          "amount_to_pay": 50.0
        },
        {
          "uuid": "l2-uuid",
          "affiliate_uuid": "d4e9b5f1-...",
          "amount_to_pay": 50.0
        }
      ]
    }
    ```
  - **Respuesta Exitosa (201 Created)**: El objeto de la contribución creada, incluyendo los enlaces.

### `PATCH /api/contributions/link/:uuid`

Actualiza un enlace específico de una contribución (ej. para registrar un pago).

  - **Parámetros de Ruta**: `uuid` del enlace (`ContributionAffiliateLinkEntity`).
  - **Cuerpo de la Petición (`Request Body`)**:
    ```json
    {
      "amount_paid": 50.0,
      "is_paid": true
    }
    ```
  - **Respuesta Exitosa (200 OK)**: El objeto del enlace actualizado.
  - **Posibles Errores**:
      - `404 Not Found`: Si el enlace no existe.

### `GET /api/contributions`

Obtiene todas las contribuciones con sus respectivos enlaces y afiliados.

### `GET /api/contributions/:uuid`

Obtiene una contribución específica por su UUID.

### `DELETE /api/contributions/:uuid`

Realiza un borrado lógico de una contribución y todos sus enlaces asociados.

-----

## Módulo de Asistencia (`/api/attendance`)

Gestiona las listas de asistencia.

### `POST /api/attendance`

Crea o actualiza una lista de asistencia completa, incluyendo todos sus registros.

  - **Descripción**: Este endpoint es "destructivo" en el sentido de que primero borra todos los registros existentes para esa lista y luego los vuelve a crear con la información enviada.
  - **Cuerpo de la Petición (`Request Body`)**:
    ```json
    {
      "uuid": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Asistencia Reunión General Julio",
      "status": "FINALIZADA",
      "created_at": "2025-07-15T09:00:00.000Z",
      "updated_at": "2025-07-15T11:00:00.000Z",
      "records": [
        {
          "uuid": "r1-uuid",
          "affiliate_uuid": "c3e8a4f0-...",
          "status": "PRESENTE",
          "registered_at": "2025-07-15T09:05:00.000Z"
        },
        {
          "uuid": "r2-uuid",
          "affiliate_uuid": "d4e9b5f1-...",
          "status": "RETRASO",
          "registered_at": "2025-07-15T09:15:00.000Z"
        }
      ]
    }
    ```
  - **Respuesta Exitosa (200 OK)**: La lista de asistencia actualizada con sus registros.

### `GET /api/attendance`

Obtiene todas las listas de asistencia.

### `DELETE /api/attendance/:uuid`

Realiza un borrado lógico de una lista de asistencia y todos sus registros.

-----

## Módulo de Configuración (`/api/configuration`)

Gestiona la configuración global de la aplicación.

### `GET /api/configuration`

Obtiene la configuración actual.

  - **Descripción**: Siempre opera sobre el registro con `id = 1`. Si no existe, lo crea con valores por defecto.
  - **Respuesta Exitosa (200 OK)**:
    ```json
    {
      "id": 1,
      "monto_multa_retraso": 5.0,
      "monto_multa_falta": 20.0,
      "backend_url": "https://mi-backend.onrender.com",
      "created_at": "...",
      "updated_at": "..."
    }
    ```

### `PATCH /api/configuration`

Actualiza la configuración.

  - **Cuerpo de la Petición (`Request Body`)**: Un objeto con los campos a actualizar.
    ```json
    {
      "monto_multa_falta": 25.0,
      "backend_url": "https://nuevo-backend.onrender.com"
    }
    ```
  - **Respuesta Exitosa (200 OK)**: El objeto de configuración actualizado.