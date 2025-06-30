# Documentación de la API

Esta es la documentación de la API para el proyecto, que parece ser una aplicación NestJS para gestionar afiliados, asistencias, contribuciones, multas y usuarios.

## Estructura del Proyecto

El proyecto está organizado en los siguientes módulos:

* **Affiliates**: Gestiona los afiliados.
* **Attendance**: Gestiona la asistencia a los eventos.
* **Contributions**: Gestiona las contribuciones de los afiliados.
* **Fines**: Gestiona las multas de los afiliados.
* **Users**: Gestiona los usuarios del sistema.
* **Configuration**: Gestiona la configuración de la aplicación.
* **Sync**: Gestiona la sincronización de datos con los clientes.

## Módulos

### Módulo de Afiliados (`affiliates`)

Este módulo es responsable de la gestión de los afiliados.

#### Entidad del Afiliado (`AffiliateEntity`)

La entidad del afiliado tiene la siguiente estructura:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `uuid` | `string` | El UUID del afiliado. |
| `id` | `string` | Un ID único para el afiliado (por ejemplo, 'AP-001'). |
| `first_name` | `string` | El nombre del afiliado. |
| `last_name` | `string` | El apellido del afiliado. |
| `ci` | `string` | El número de carnet de identidad del afiliado. |
| `phone` | `string` | El número de teléfono del afiliado (opcional). |
| `original_affiliate_name` | `string` | El nombre original del afiliado. |
| `current_affiliate_name` | `string` | El nombre actual del afiliado. |
| `profile_photo_url` | `string` | La URL de la foto de perfil del afiliado (opcional). |
| `credential_photo_url` | `string` | La URL de la foto de la credencial del afiliado (opcional). |
| `tags` | `string` | Las etiquetas asociadas al afiliado. |
| `total_paid` | `number` | El total pagado por el afiliado. |
| `total_debt` | `number` | La deuda total del afiliado. |
| `created_at` | `Date` | La fecha y hora de creación del afiliado. |
| `updated_at` | `Date` | La fecha y hora de la última actualización del afiliado. |

#### Controlador de Afiliados (`AffiliatesController`)

El controlador de afiliados expone los siguientes endpoints:

* **`POST /api/affiliates`**: Crea o actualiza un afiliado.
    * **Body**: `CreateAffiliateDto`
* **`GET /api/affiliates`**: Obtiene todos los afiliados.
* **`GET /api/affiliates/:uuid`**: Obtiene un único afiliado por su UUID.
* **`PUT /api/affiliates/:uuid`** y **`PATCH /api/affiliates/:uuid`**: Actualiza un afiliado.
    * **Body**: `CreateAffiliateDto`
* **`DELETE /api/affiliates/:uuid`**: Elimina un afiliado.

### Módulo de Asistencia (`attendance`)

Este módulo gestiona la asistencia a los eventos.

#### Entidades de Asistencia

* **`AttendanceListEntity`**: Representa una lista de asistencia.
    * `uuid`: `string` - El UUID de la lista de asistencia.
    * `name`: `string` - El nombre de la lista de asistencia.
    * `created_at`: `Date` - La fecha y hora de creación de la lista.
    * `status`: `string` - El estado de la lista ('PREPARADA', 'INICIADA', etc.).
    * `records`: `AttendanceRecordEntity[]` - Los registros de asistencia asociados a la lista.
    * `updated_at`: `Date` - La fecha y hora de la última actualización.
* **`AttendanceRecordEntity`**: Representa un registro de asistencia individual.
    * `uuid`: `string` - El UUID del registro de asistencia.
    * `list_uuid`: `string` - El UUID de la lista de asistencia a la que pertenece el registro.
    * `affiliate_uuid`: `string` - El UUID del afiliado.
    * `registered_at`: `Date` - La fecha y hora en que se registró la asistencia.
    * `status`: `string` - El estado de la asistencia ('PRESENTE', 'RETRASO', etc.).
    * `created_at`: `Date` - La fecha y hora de creación.
    * `updated_at`: `Date` - La fecha y hora de la última actualización.

#### Controlador de Asistencia (`AttendanceController`)

El controlador de asistencia expone los siguientes endpoints:

* **`POST /api/attendance`**: Crea o actualiza una lista de asistencia y sus registros.
    * **Body**: `CreateAttendanceDto`
* **`GET /api/attendance`**: Obtiene todas las listas de asistencia.
* **`DELETE /api/attendance/:uuid`**: Elimina una lista de asistencia y sus registros asociados.

### Módulo de Contribuciones (`contributions`)

Este módulo gestiona las contribuciones de los afiliados.

#### Entidades de Contribuciones

* **`ContributionEntity`**: Representa una contribución.
    * `uuid`: `string` - El UUID de la contribución.
    * `name`: `string` - El nombre de la contribución.
    * `description`: `string` - Una descripción de la contribución (opcional).
    * `date`: `Date` - La fecha de la contribución.
    * `default_amount`: `number` - El monto por defecto de la contribución.
    * `is_general`: `boolean` - Indica si la contribución es general.
    * `links`: `ContributionAffiliateLinkEntity[]` - Los enlaces a los afiliados asociados a la contribución.
    * `created_at`: `Date` - La fecha y hora de creación.
    * `updated_at`: `Date` - La fecha y hora de la última actualización.
* **`ContributionAffiliateLinkEntity`**: Representa el enlace entre una contribución y un afiliado.
    * `uuid`: `string` - El UUID del enlace.
    * `contribution_uuid`: `string` - El UUID de la contribución.
    * `affiliate_uuid`: `string` - El UUID del afiliado.
    * `amount_to_pay`: `number` - El monto a pagar por el afiliado.
    * `amount_paid`: `number` - El monto pagado por el afiliado.
    * `is_paid`: `boolean` - Indica si la contribución ha sido pagada.
    * `created_at`: `Date` - La fecha y hora de creación.
    * `updated_at`: `Date` - La fecha y hora de la última actualización.

#### Controlador de Contribuciones (`ContributionsController`)

El controlador de contribuciones expone los siguientes endpoints:

* **`POST /api/contributions`**: Crea una nueva contribución.
    * **Body**: `CreateContributionDto`
* **`GET /api/contributions`**: Obtiene todas las contribuciones.
* **`GET /api/contributions/:uuid`**: Obtiene una contribución específica.
* **`PATCH /api/contributions/link/:uuid`**: Actualiza un enlace de contribución.
    * **Body**: `PatchContributionLinkDto`
* **`DELETE /api/contributions/:uuid`**: Elimina una contribución.

### Módulo de Multas (`fines`)

Este módulo gestiona las multas de los afiliados.

#### Entidad de Multa (`FineEntity`)

La entidad de multa tiene la siguiente estructura:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `uuid` | `string` | El UUID de la multa. |
| `description` | `string` | La descripción de la multa. |
| `amount` | `number` | El monto de la multa. |
| `amount_paid` | `number` | El monto pagado de la multa. |
| `date` | `Date` | La fecha de la multa. |
| `is_paid` | `boolean` | Indica si la multa ha sido pagada. |
| `category` | `string` | La categoría de la multa. |
| `related_attendance_uuid` | `string` | El UUID de la lista de asistencia relacionada (opcional). |
| `affiliate_uuid` | `string` | El UUID del afiliado al que pertenece la multa. |
| `created_at` | `Date` | La fecha y hora de creación. |
| `updated_at` | `Date` | La fecha y hora de la última actualización. |

#### Controlador de Multas (`FinesController`)

El controlador de multas expone los siguientes endpoints:

* **`POST /api/fines`**: Crea o actualiza una multa.
    * **Body**: `CreateFineDto`
* **`PUT /api/fines/:uuid`** y **`PATCH /api/fines/:uuid`**: Actualiza una multa.
    * **Body**: `UpdateFineDto`
* **`DELETE /api/fines/:uuid`**: Elimina una multa.
* **`GET /api/fines`**: Obtiene todas las multas.
* **`GET /api/fines/by-affiliate/:affiliateId`**: Obtiene todas las multas de un afiliado.

### Módulo de Usuarios (`users`)

Este módulo gestiona los usuarios del sistema.

#### Entidad de Usuario (`UserEntity`)

La entidad de usuario tiene la siguiente estructura:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `uuid` | `string` | El UUID del usuario. |
| `user_name` | `string` | El nombre de usuario. |
| `password_hash` | `string` | El hash de la contraseña del usuario. |
| `email` | `string` | El correo electrónico del usuario. |
| `role` | `string` | El rol del usuario. |
| `created_at` | `Date` | La fecha y hora de creación. |
| `updated_at` | `Date` | La fecha y hora de la última actualización. |

#### Controlador de Usuarios (`UsersController`)

El controlador de usuarios expone los siguientes endpoints:

* **`POST /api/users`**: Crea o actualiza un usuario.
    * **Body**: `CreateUserDto`
* **`PUT /api/users/:uuid`** y **`PATCH /api/users/:uuid`**: Actualiza un usuario.
    * **Body**: `UpdateUserDto`
* **`DELETE /api/users/:uuid`**: Elimina un usuario.
* **`GET /api/users`**: Obtiene todos los usuarios.

### Módulo de Configuración (`configuration`)

Este módulo gestiona la configuración de la aplicación.

#### Entidad de Configuración (`Configuration`)

La entidad de configuración tiene la siguiente estructura:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `number` | El ID de la configuración (siempre es 1). |
| `monto_multa_retraso` | `number` | El monto de la multa por retraso. |
| `monto_multa_falta` | `number` | El monto de la multa por falta. |
| `backend_url` | `string` | La URL del backend. |
| `created_at` | `Date` | La fecha y hora de creación. |
| `updated_at` | `Date` | La fecha y hora de la última actualización. |

#### Controlador de Configuración (`ConfigurationController`)

El controlador de configuración expone los siguientes endpoints:

* **`GET /api/configuration`**: Obtiene la configuración.
* **`PATCH /api/configuration`**: Actualiza la configuración.
    * **Body**: `UpdateConfigurationDto`

### Módulo de Sincronización (`sync`)

Este módulo gestiona la sincronización de datos con los clientes.

#### Controlador de Sincronización (`SyncController`)

El controlador de sincronización expone el siguiente endpoint:

* **`GET /api/sync/pull`**: Obtiene los cambios desde la última sincronización.
    * **Query Param**: `lastSync` (opcional) - El timestamp de la última sincronización en formato ISO 8601.

---
Espero que esta documentación sea de gran ayuda. ¡Si tienes alguna otra pregunta, no dudes en consultarme!