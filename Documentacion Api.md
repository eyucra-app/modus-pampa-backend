# Documentación de la API Backend

Este documento detalla la funcionalidad de la API RESTful para la aplicación de gestión de afiliados, asistencia, contribuciones, multas, sincronización y usuarios. Está construida con NestJS y TypeORM, utilizando PostgreSQL como base de datos.

---

## 1. Módulos y Entidades Principales

La aplicación se compone de varios módulos, cada uno gestionando una parte específica del negocio y sus correspondientes entidades de base de datos.

### 1.1. Módulo de Afiliados (`AffiliatesModule`)

Gestiona la información de los afiliados.

#### 1.1.1. Entidad: `AffiliateEntity` (`src/affiliates/entities/affiliate.entity.ts`)

Representa a un afiliado en la base de datos.

| Campo                    | Tipo      | Descripción                                   | Restricciones            |
| :----------------------- | :-------- | :-------------------------------------------- | :----------------------- |
| `uuid`                   | `string`  | Identificador único universal (Primary Key)   | `@PrimaryColumn`, `UUID` |
| `id`                     | `string`  | ID legible, ej. 'AP-001'                      | `@Column`, `unique`      |
| `first_name`             | `string`  | Nombre del afiliado                           | `@Column`                |
| `last_name`              | `string`  | Apellido del afiliado                         | `@Column`                |
| `ci`                     | `string`  | Cédula de identidad                           | `@Column`, `unique`      |
| `phone`                  | `string`  | Número de teléfono (opcional)                 | `@Column`, `nullable`    |
| `original_affiliate_name`| `string`  | Nombre original del afiliado (por defecto '-')| `@Column`                |
| `current_affiliate_name` | `string`  | Nombre actual del afiliado (por defecto '-')  | `@Column`                |
| `profile_photo_url`      | `string`  | URL de la foto de perfil (opcional)           | `@Column`, `nullable`    |
| `credential_photo_url`   | `string`  | URL de la foto de credencial (opcional)       | `@Column`, `nullable`    |
| `tags`                   | `string[]`| Etiquetas asociadas al afiliado               | `simple-array`, `default: []` |
| `total_paid`             | `number`  | Cantidad total pagada (por defecto 0.0)       | `float`, `default: 0.0`  |
| `total_debt`             | `number`  | Cantidad total adeudada (por defecto 0.0)     | `float`, `default: 0.0`  |
| `created_at`             | `Date`    | Fecha de creación                             | `@CreateDateColumn`      |
| `updated_at`             | `Date`    | Última fecha de actualización                 | `@UpdateDateColumn`      |

#### 1.1.2. DTOs

* **`CreateAffiliateDto`** (`src/affiliates/dto/create-affiliate.dto.ts`): Utilizado para la creación y actualización de afiliados. Incluye todos los campos de `AffiliateEntity` con validaciones.
* **`UpdateAffiliateDto`** (`src/affiliates/dto/update-affiliate.dto.ts`): Extiende `PartialType` de `CreateAffiliateDto`, haciendo todos sus campos opcionales para actualizaciones parciales.

#### 1.1.3. Servicios (`AffiliatesService`)

* `upsert(affiliateData: CreateAffiliateDto): Promise<AffiliateEntity>`: Crea un nuevo afiliado o actualiza uno existente si el `uuid` ya existe.
* `remove(uuid: string): Promise<void>`: Elimina un afiliado por su `uuid`. Lanza `NotFoundException` si no se encuentra.
* `findAll(): Promise<AffiliateEntity[]>`: Encuentra y retorna todos los afiliados.
* `findOne(uuid: string): Promise<AffiliateEntity>`: Encuentra y retorna un afiliado por su `uuid`. Lanza `NotFoundException` si no se encuentra.

#### 1.1.4. Endpoints (`AffiliatesController`)

**Base URL**: `/api/affiliates`

* **`POST /api/affiliates`**
    * **Descripción**: Crea o actualiza un afiliado. La lógica de "upsert" (insertar o actualizar) se maneja en el servicio.
    * **Request Body**: `CreateAffiliateDto`
    * **Response**: `AffiliateEntity` (HTTP 200 OK)
    * **Ejemplo de Request Body**:
        ```json
        {
          "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "id": "AP-001",
          "first_name": "Juan",
          "last_name": "Perez",
          "ci": "1234567",
          "phone": "555-1234",
          "profile_photo_url": "[http://example.com/photo.jpg](http://example.com/photo.jpg)",
          "credential_photo_url": "[http://example.com/credential.jpg](http://example.com/credential.jpg)",
          "tags": ["activo", "directiva"],
          "total_paid": 100.50,
          "total_debt": 20.00
        }
        ```
    * **Ejemplo de Response**:
        ```json
        {
          "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "id": "AP-001",
          "first_name": "Juan",
          "last_name": "Perez",
          "ci": "1234567",
          "phone": "555-1234",
          "original_affiliate_name": "-",
          "current_affiliate_name": "-",
          "profile_photo_url": "[http://example.com/photo.jpg](http://example.com/photo.jpg)",
          "credential_photo_url": "[http://example.com/credential.jpg](http://example.com/credential.jpg)",
          "tags": ["activo", "directiva"],
          "total_paid": 100.50,
          "total_debt": 20.00,
          "created_at": "2023-10-27T10:00:00.000Z",
          "updated_at": "2023-10-27T10:00:00.000Z"
        }
        ```

* **`PATCH /api/affiliates/:uuid`**
    * **Descripción**: Actualiza un afiliado existente. Reutiliza la lógica de "upsert".
    * **Parámetros de Ruta**: `uuid: string` (UUID del afiliado a actualizar, aunque la lógica del servicio usa el `uuid` del cuerpo).
    * **Request Body**: `CreateAffiliateDto`
    * **Response**: `AffiliateEntity` (HTTP 200 OK)

* **`GET /api/affiliates`**
    * **Descripción**: Obtiene una lista de todos los afiliados.
    * **Response**: `AffiliateEntity[]` (HTTP 200 OK)
    * **Ejemplo de Response**:
        ```json
        [
          {
            "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "id": "AP-001",
            "first_name": "Juan",
            "last_name": "Perez",
            "ci": "1234567",
            "phone": "555-1234",
            "original_affiliate_name": "-",
            "current_affiliate_name": "-",
            "profile_photo_url": "[http://example.com/photo.jpg](http://example.com/photo.jpg)",
            "credential_photo_url": "[http://example.com/credential.jpg](http://example.com/credential.jpg)",
            "tags": ["activo", "directiva"],
            "total_paid": 100.50,
            "total_debt": 20.00,
            "created_at": "2023-10-27T10:00:00.000Z",
            "updated_at": "2023-10-27T10:00:00.000Z"
          },
          {
            "uuid": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
            "id": "AP-002",
            "first_name": "Maria",
            "last_name": "Gomez",
            "ci": "7654321",
            "phone": "555-5678",
            "original_affiliate_name": "-",
            "current_affiliate_name": "-",
            "profile_photo_url": null,
            "credential_photo_url": null,
            "tags": [],
            "total_paid": 50.00,
            "total_debt": 0.00,
            "created_at": "2023-10-26T09:00:00.000Z",
            "updated_at": "2023-10-26T09:00:00.000Z"
          }
        ]
        ```

* **`GET /api/affiliates/:uuid`**
    * **Descripción**: Obtiene un afiliado específico por su UUID.
    * **Parámetros de Ruta**: `uuid: string` (UUID del afiliado a buscar).
    * **Response**: `AffiliateEntity` (HTTP 200 OK)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si el afiliado no existe.

* **`DELETE /api/affiliates/:uuid`**
    * **Descripción**: Elimina un afiliado por su UUID.
    * **Parámetros de Ruta**: `uuid: string` (UUID del afiliado a eliminar).
    * **Response**: (HTTP 204 No Content)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si el afiliado no existe.

---

### 1.2. Módulo de Asistencia (`AttendanceModule`)

Gestiona las listas y registros de asistencia.

#### 1.2.1. Entidades

* **`AttendanceListEntity`** (`src/attendance/entities/attendance-list.entity.ts`)
    Representa una lista de asistencia.

    | Campo        | Tipo      | Descripción                             | Restricciones             |
    | :----------- | :-------- | :-------------------------------------- | :------------------------ |
    | `id`         | `number`  | Identificador único (Primary Key)       | `@PrimaryGeneratedColumn` |
    | `name`       | `string`  | Nombre de la lista de asistencia        | `@Column`                 |
    | `created_at` | `Date`    | Fecha de creación de la lista           | `@Column`                 |
    | `status`     | `string`  | Estado de la lista (ej. 'PREPARADA')    | `@Column`                 |
    | `records`    | `AttendanceRecordEntity[]` | Registros de asistencia asociados | `@OneToMany`              |
    | `updated_at` | `Date`    | Última fecha de actualización           | `@UpdateDateColumn`       |

* **`AttendanceRecordEntity`** (`src/attendance/entities/attendance-record.entity.ts`)
    Representa un registro individual de asistencia dentro de una lista.

    | Campo          | Tipo      | Descripción                             | Restricciones             |
    | :------------- | :-------- | :-------------------------------------- | :------------------------ |
    | `id`           | `number`  | Identificador único (Primary Key)       | `@PrimaryGeneratedColumn` |
    | `listId`       | `number`  | ID de la lista de asistencia a la que pertenece | `@Column`                 |
    | `affiliateUuid`| `string`  | UUID del afiliado registrado           | `@Column`                 |
    | `registeredAt` | `Date`    | Fecha y hora del registro de asistencia | `@Column`                 |
    | `status`       | `string`  | Estado de asistencia (ej. 'PRESENTE')   | `@Column`                 |
    | `attendanceList`| `AttendanceListEntity` | Relación con la lista de asistencia | `@ManyToOne`              |
    | `affiliate`    | `AffiliateEntity` | Relación con el afiliado               | `@ManyToOne`              |

#### 1.2.2. DTOs

* **`CreateAttendanceDto`** (`src/attendance/dto/create-attendance.dto.ts`)
    Utilizado para crear o actualizar una lista de asistencia, incluyendo sus registros.

    | Campo       | Tipo      | Descripción                             |
    | :---------- | :-------- | :-------------------------------------- |
    | `name`      | `string`  | Nombre de la lista                      |
    | `created_at`| `string`  | Fecha de creación (ISO 8601 string)     |
    | `status`    | `string`  | Estado inicial de la lista              |
    | `records`   | `AttendanceRecordDto[]` | Array de registros de asistencia|

* **`AttendanceRecordDto`** (`src/attendance/dto/attendance-record.dto.ts`)
    Representa un registro individual de asistencia.

    | Campo         | Tipo      | Descripción                             |
    | :------------ | :-------- | :-------------------------------------- |
    | `affiliateUuid`| `string`  | UUID del afiliado                       |
    | `status`      | `string`  | Estado de asistencia                    |
    | `registeredAt`| `string`  | Fecha y hora de registro (ISO 8601 string)|

* **`UpdateAttendanceDto`** (`src/attendance/dto/update-attendance.dto.ts`)
    Extiende `PartialType` de `CreateAttendanceDto`.

#### 1.2.3. Servicios (`AttendanceService`)

* `upsert(createDto: CreateAttendanceDto, id?: number): Promise<AttendanceListEntity>`: Crea una nueva lista de asistencia o actualiza una existente. Si se proporciona `id`, actualiza; de lo contrario, crea. Maneja la creación/actualización y eliminación de `AttendanceRecordEntity` asociados dentro de una transacción.
* `findAll(): Promise<AttendanceListEntity[]>`: Retorna todas las listas de asistencia con sus registros asociados.
* `findOne(id: number): Promise<AttendanceListEntity>`: Retorna una lista de asistencia por su ID, incluyendo sus registros y la información del afiliado. Lanza `NotFoundException` si no se encuentra.
* `remove(id: number): Promise<void>`: Elimina una lista de asistencia por su ID. Lanza `NotFoundException` si no se encuentra.

#### 1.2.4. Endpoints (`AttendanceController`)

**Base URL**: `/api/attendance`

* **`POST /api/attendance`**
    * **Descripción**: Crea una nueva lista de asistencia con sus registros.
    * **Request Body**: `CreateAttendanceDto`
    * **Response**: `AttendanceListEntity` (HTTP 201 Created por defecto de NestJS para POST)
    * **Ejemplo de Request Body**:
        ```json
        {
          "name": "Asistencia Reunión General",
          "created_at": "2024-06-20T08:00:00Z",
          "status": "INICIADA",
          "records": [
            {
              "affiliateUuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
              "status": "PRESENTE",
              "registeredAt": "2024-06-20T08:05:00Z"
            },
            {
              "affiliateUuid": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
              "status": "RETRASO",
              "registeredAt": "2024-06-20T08:15:00Z"
            }
          ]
        }
        ```
    * **Ejemplo de Response**:
        ```json
        {
          "id": 1,
          "name": "Asistencia Reunión General",
          "created_at": "2024-06-20T08:00:00.000Z",
          "status": "INICIADA",
          "updated_at": "2024-06-20T08:00:00.000Z",
          "records": [
            {
              "id": 101,
              "listId": 1,
              "affiliateUuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
              "registeredAt": "2024-06-20T08:05:00.000Z",
              "status": "PRESENTE",
              "affiliate": {
                 "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                 "id": "AP-001",
                 "first_name": "Juan",
                 "last_name": "Perez",
                 "ci": "1234567",
                 "phone": "555-1234",
                 "original_affiliate_name": "-",
                 "current_affiliate_name": "-",
                 "profile_photo_url": "[http://example.com/photo.jpg](http://example.com/photo.jpg)",
                 "credential_photo_url": "[http://example.com/credential.jpg](http://example.com/credential.jpg)",
                 "tags": ["activo", "directiva"],
                 "total_paid": 100.50,
                 "total_debt": 20.00,
                 "created_at": "2023-10-27T10:00:00.000Z",
                 "updated_at": "2023-10-27T10:00:00.000Z"
              }
            }
            // ... otros registros
          ]
        }
        ```

* **`PATCH /api/attendance/:id`**
    * **Descripción**: Actualiza una lista de asistencia existente y sus registros asociados.
    * **Parámetros de Ruta**: `id: number` (ID de la lista de asistencia).
    * **Request Body**: `CreateAttendanceDto`
    * **Response**: `AttendanceListEntity` (HTTP 200 OK)

* **`GET /api/attendance`**
    * **Descripción**: Obtiene todas las listas de asistencia.
    * **Response**: `AttendanceListEntity[]` (HTTP 200 OK)

* **`GET /api/attendance/:id`**
    * **Descripción**: Obtiene una lista de asistencia específica por su ID.
    * **Parámetros de Ruta**: `id: number` (ID de la lista de asistencia).
    * **Response**: `AttendanceListEntity` (HTTP 200 OK)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si la lista no existe.

* **`DELETE /api/attendance/:id`**
    * **Descripción**: Elimina una lista de asistencia por su ID.
    * **Parámetros de Ruta**: `id: number` (ID de la lista de asistencia).
    * **Response**: (HTTP 204 No Content)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si la lista no existe.

---

### 1.3. Módulo de Contribuciones (`ContributionsModule`)

Gestiona las contribuciones y los enlaces de contribución a afiliados.

#### 1.3.1. Entidades

* **`ContributionEntity`** (`src/contributions/entities/contribution.entity.ts`)
    Representa una contribución general.

    | Campo          | Tipo      | Descripción                             | Restricciones             |
    | :------------- | :-------- | :-------------------------------------- | :------------------------ |
    | `id`           | `number`  | Identificador único (Primary Key)       | `@PrimaryGeneratedColumn` |
    | `name`         | `string`  | Nombre de la contribución               | `@Column`                 |
    | `description`  | `string`  | Descripción (opcional)                  | `@Column`, `nullable`     |
    | `date`         | `Date`    | Fecha de la contribución                | `@Column`                 |
    | `defaultAmount`| `number`  | Cantidad predeterminada de la contribución | `@Column` (`total_amount`)|
    | `isGeneral`    | `boolean` | Indica si es una contribución general   | `@Column`, `default: true`|
    | `links`        | `ContributionAffiliateLinkEntity[]` | Enlaces a afiliados específicos | `@OneToMany`              |
    | `created_at`   | `Date`    | Fecha de creación                       | `@CreateDateColumn`       |
    | `updated_at`   | `Date`    | Última fecha de actualización           | `@UpdateDateColumn`       |

* **`ContributionAffiliateLinkEntity`** (`src/contributions/entities/contribution-affiliate-link.entity.ts`)
    Representa el enlace entre una contribución y un afiliado, detallando la cantidad a pagar y pagada.

    | Campo            | Tipo      | Descripción                             | Restricciones             |
    | :--------------- | :-------- | :-------------------------------------- | :------------------------ |
    | `contributionId` | `number`  | ID de la contribución (Primary Key Parte)| `@PrimaryColumn`          |
    | `affiliateUuid`  | `string`  | UUID del afiliado (Primary Key Parte)   | `@PrimaryColumn`          |
    | `amountToPay`    | `number`  | Cantidad que el afiliado debe pagar     | `@Column`                 |
    | `amountPaid`     | `number`  | Cantidad que el afiliado ya pagó (default 0.0) | `@Column`                 |
    | `isPaid`         | `boolean` | Indica si la contribución ha sido pagada (default false) | `@Column`                 |
    | `contribution`   | `ContributionEntity` | Relación con la contribución | `@ManyToOne`              |
    | `affiliate`      | `AffiliateEntity` | Relación con el afiliado       | `@ManyToOne`              |

#### 1.3.2. DTOs

* **`CreateContributionDto`** (`src/contributions/dto/create-contribution.dto.ts`)
    Utilizado para crear o actualizar una contribución.

    | Campo          | Tipo      | Descripción                             |
    | :------------- | :-------- | :-------------------------------------- |
    | `name`         | `string`  | Nombre de la contribución               |
    | `description`  | `string`  | Descripción (opcional)                  |
    | `date`         | `string`  | Fecha (ISO 8601 string)                 |
    | `defaultAmount`| `number`  | Cantidad por defecto                    |
    | `isGeneral`    | `boolean` | Indica si es general (opcional, default true)|
    | `links`        | `ContributionAffiliateLinkDto[]` | Array de enlaces a afiliados    |

* **`ContributionAffiliateLinkDto`** (`src/contributions/dto/contribution-affiliate-link.dto.ts`)
    Representa un enlace de contribución para un afiliado.

    | Campo         | Tipo      | Descripción                             |
    | :------------ | :-------- | :-------------------------------------- |
    | `affiliateUuid`| `string`  | UUID del afiliado                       |
    | `amountToPay` | `number`  | Cantidad a pagar por el afiliado        |
    | `amountPaid`  | `number`  | Cantidad pagada (opcional, default 0.0) |
    | `isPaid`      | `boolean` | Si está pagada (opcional, default false)|

* **`UpdateContributionDto`** (`src/contributions/dto/update-contribution.dto.ts`)
    Extiende `PartialType` de `CreateContributionDto`.

#### 1.3.3. Servicios (`ContributionsService`)

* `upsert(createDto: CreateContributionDto, id?: number): Promise<ContributionEntity>`: Crea una nueva contribución o actualiza una existente. Maneja la eliminación y recreación de `ContributionAffiliateLinkEntity` asociados dentro de una transacción.
* `findAll(): Promise<ContributionEntity[]>`: Retorna todas las contribuciones con sus enlaces.
* `findOne(id: number): Promise<ContributionEntity>`: Retorna una contribución por su ID, incluyendo sus enlaces y la información del afiliado. Lanza `NotFoundException` si no se encuentra.
* `remove(id: number): Promise<void>`: Elimina una contribución por su ID. Lanza `NotFoundException` si no se encuentra.

#### 1.3.4. Endpoints (`ContributionsController`)

**Base URL**: `/api/contributions`

* **`POST /api/contributions`**
    * **Descripción**: Crea una nueva contribución, incluyendo sus enlaces a afiliados.
    * **Request Body**: `CreateContributionDto`
    * **Response**: `ContributionEntity` (HTTP 201 Created por defecto de NestJS para POST)
    * **Ejemplo de Request Body**:
        ```json
        {
          "name": "Cuota Mensual Enero",
          "description": "Cuota regular de enero",
          "date": "2024-01-01T00:00:00Z",
          "defaultAmount": 25.00,
          "isGeneral": true,
          "links": [
            {
              "affiliateUuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
              "amountToPay": 25.00,
              "amountPaid": 25.00,
              "isPaid": true
            },
            {
              "affiliateUuid": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
              "amountToPay": 25.00,
              "amountPaid": 0.0,
              "isPaid": false
            }
          ]
        }
        ```
    * **Ejemplo de Response**:
        ```json
        {
          "id": 1,
          "name": "Cuota Mensual Enero",
          "description": "Cuota regular de enero",
          "date": "2024-01-01T00:00:00.000Z",
          "defaultAmount": 25.00,
          "isGeneral": true,
          "created_at": "2024-06-20T10:00:00.000Z",
          "updated_at": "2024-06-20T10:00:00.000Z",
          "links": [
            {
              "contributionId": 1,
              "affiliateUuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
              "amountToPay": 25,
              "amountPaid": 25,
              "isPaid": true,
              "affiliate": {
                 "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                 "id": "AP-001",
                 "first_name": "Juan",
                 "last_name": "Perez",
                 "ci": "1234567",
                 "phone": "555-1234",
                 "original_affiliate_name": "-",
                 "current_affiliate_name": "-",
                 "profile_photo_url": "[http://example.com/photo.jpg](http://example.com/photo.jpg)",
                 "credential_photo_url": "[http://example.com/credential.jpg](http://example.com/credential.jpg)",
                 "tags": ["activo", "directiva"],
                 "total_paid": 100.50,
                 "total_debt": 20.00,
                 "created_at": "2023-10-27T10:00:00.000Z",
                 "updated_at": "2023-10-27T10:00:00.000Z"
              }
            }
            // ... otros enlaces
          ]
        }
        ```

* **`PATCH /api/contributions/:id`**
    * **Descripción**: Actualiza una contribución existente y sus enlaces.
    * **Parámetros de Ruta**: `id: number` (ID de la contribución).
    * **Request Body**: `CreateContributionDto`
    * **Response**: `ContributionEntity` (HTTP 200 OK)

* **`GET /api/contributions`**
    * **Descripción**: Obtiene todas las contribuciones.
    * **Response**: `ContributionEntity[]` (HTTP 200 OK)

* **`GET /api/contributions/:id`**
    * **Descripción**: Obtiene una contribución específica por su ID.
    * **Parámetros de Ruta**: `id: number` (ID de la contribución).
    * **Response**: `ContributionEntity` (HTTP 200 OK)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si la contribución no existe.

* **`DELETE /api/contributions/:id`**
    * **Descripción**: Elimina una contribución por su ID.
    * **Parámetros de Ruta**: `id: number` (ID de la contribución).
    * **Response**: (HTTP 204 No Content)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si la contribución no existe.

---

### 1.4. Módulo de Multas (`FinesModule`)

Gestiona las multas impuestas a los afiliados.

#### 1.4.1. Entidad: `FineEntity` (`src/fines/entities/fine.entity.ts`)

Representa una multa.

| Campo        | Tipo      | Descripción                             | Restricciones            |
| :----------- | :-------- | :-------------------------------------- | :----------------------- |
| `uuid`       | `string`  | Identificador único universal (Primary Key)| `@PrimaryColumn`, `UUID` |
| `description`| `string`  | Descripción de la multa                 | `@Column`                |
| `amount`     | `number`  | Cantidad de la multa                    | `float`, `@Column`       |
| `date`       | `Date`    | Fecha de la multa                       | `@Column`                |
| `status`     | `string`  | Estado de la multa (ej. 'pending', 'paid')| `@Column`                |
| `affiliateId`| `string`  | UUID del afiliado asociado              | `@Column`                |
| `affiliate`  | `AffiliateEntity` | Relación con el afiliado              | `@ManyToOne`             |
| `created_at` | `Date`    | Fecha de creación                       | `@CreateDateColumn`      |
| `updated_at` | `Date`    | Última fecha de actualización           | `@UpdateDateColumn`      |

#### 1.4.2. DTOs

* **`CreateFineDto`** (`src/fines/dto/create-fine.dto.ts`)
    Utilizado para crear o actualizar una multa.

    | Campo        | Tipo      | Descripción                             |
    | :----------- | :-------- | :-------------------------------------- |
    | `uuid`       | `string`  | UUID de la multa                        |
    | `description`| `string`  | Descripción                             |
    | `amount`     | `number`  | Cantidad                                |
    | `date`       | `string`  | Fecha (ISO 8601 string)                 |
    | `status`     | `string`  | Estado                                  |
    | `affiliateId`| `string`  | UUID del afiliado                       |

* **`UpdateFineDto`** (`src/fines/dto/update-fine.dto.ts`)
    Extiende `PartialType` de `CreateFineDto`.

#### 1.4.3. Servicios (`FinesService`)

* `upsert(fineData: CreateFineDto): Promise<FineEntity>`: Crea una nueva multa o actualiza una existente.
* `remove(uuid: string): Promise<void>`: Elimina una multa por su `uuid`. Lanza `NotFoundException` si no se encuentra.
* `findAll(): Promise<FineEntity[]>`: Retorna todas las multas con sus afiliados relacionados.
* `findByAffiliate(affiliateId: string): Promise<FineEntity[]>`: Retorna todas las multas de un afiliado específico por su `affiliateId`.

#### 1.4.4. Endpoints (`FinesController`)

**Base URL**: `/api/fines`

* **`POST /api/fines`**
    * **Descripción**: Crea o actualiza una multa.
    * **Request Body**: `CreateFineDto`
    * **Response**: `FineEntity` (HTTP 200 OK)
    * **Ejemplo de Request Body**:
        ```json
        {
          "uuid": "f1e2d3c4-b5a6-7890-1234-567890abcdef",
          "description": "Multa por retraso en reunión",
          "amount": 10.00,
          "date": "2024-06-15T14:30:00Z",
          "status": "pending",
          "affiliateId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        }
        ```
    * **Ejemplo de Response**:
        ```json
        {
          "uuid": "f1e2d3c4-b5a6-7890-1234-567890abcdef",
          "description": "Multa por retraso en reunión",
          "amount": 10,
          "date": "2024-06-15T14:30:00.000Z",
          "status": "pending",
          "affiliateId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "created_at": "2024-06-20T10:00:00.000Z",
          "updated_at": "2024-06-20T10:00:00.000Z"
        }
        ```

* **`PATCH /api/fines/:uuid`**
    * **Descripción**: Actualiza una multa existente.
    * **Parámetros de Ruta**: `uuid: string` (UUID de la multa, aunque la lógica usa el UUID del cuerpo).
    * **Request Body**: `CreateFineDto`
    * **Response**: `FineEntity` (HTTP 200 OK)

* **`DELETE /api/fines/:uuid`**
    * **Descripción**: Elimina una multa por su UUID.
    * **Parámetros de Ruta**: `uuid: string` (UUID de la multa a eliminar).
    * **Response**: (HTTP 204 No Content)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si la multa no existe.

* **`GET /api/fines`**
    * **Descripción**: Obtiene todas las multas.
    * **Response**: `FineEntity[]` (HTTP 200 OK)

* **`GET /api/fines/by-affiliate/:affiliateId`**
    * **Descripción**: Obtiene todas las multas asociadas a un afiliado específico.
    * **Parámetros de Ruta**: `affiliateId: string` (UUID del afiliado).
    * **Response**: `FineEntity[]` (HTTP 200 OK)
    * **Ejemplo de Response**:
        ```json
        [
          {
            "uuid": "f1e2d3c4-b5a6-7890-1234-567890abcdef",
            "description": "Multa por retraso en reunión",
            "amount": 10,
            "date": "2024-06-15T14:30:00.000Z",
            "status": "pending",
            "affiliateId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "created_at": "2024-06-20T10:00:00.000Z",
            "updated_at": "2024-06-20T10:00:00.000Z",
            "affiliate": {
                 "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                 "id": "AP-001",
                 "first_name": "Juan",
                 "last_name": "Perez",
                 "ci": "1234567",
                 "phone": "555-1234",
                 "original_affiliate_name": "-",
                 "current_affiliate_name": "-",
                 "profile_photo_url": "[http://example.com/photo.jpg](http://example.com/photo.jpg)",
                 "credential_photo_url": "[http://example.com/credential.jpg](http://example.com/credential.jpg)",
                 "tags": ["activo", "directiva"],
                 "total_paid": 100.50,
                 "total_debt": 20.00,
                 "created_at": "2023-10-27T10:00:00.000Z",
                 "updated_at": "2023-10-27T10:00:00.000Z"
              }
          }
        ]
        ```

---

### 1.5. Módulo de Sincronización (`SyncModule`)

Gestiona la lógica para la sincronización de datos entre el cliente (Flutter) y el servidor.

#### 1.5.1. Entidad: `SyncEntity` (`src/sync/entities/sync.entity.ts`)

Actualmente es una entidad de marcador de posición y no tiene campos definidos.

#### 1.5.2. DTOs

* **`CreateSyncDto`** (`src/sync/dto/create-sync.dto.ts`)
    Actualmente es un DTO de marcador de posición y no tiene campos definidos.
* **`UpdateSyncDto`** (`src/sync/dto/update-sync.dto.ts`)
    Extiende `PartialType` de `CreateSyncDto`.

#### 1.5.3. Servicios (`SyncService`)

* `pullChanges(lastSyncTimestamp?: string)`: Retorna todos los datos de los diferentes módulos (afiliados, usuarios, multas, contribuciones, asistencia) que hayan sido actualizados **después** del `lastSyncTimestamp` proporcionado. Si no se proporciona un `lastSyncTimestamp`, retorna todos los datos.
    * Para `ContributionEntity`, carga la relación `links`.
    * Para `AttendanceListEntity`, carga la relación `records`.

#### 1.5.4. Endpoints (`SyncController`)

**Base URL**: `/api/sync`

* **`GET /api/sync/pull`**
    * **Descripción**: Sincroniza datos desde el servidor. Opcionalmente, puede recibir un `lastSync` timestamp para solo obtener los cambios recientes.
    * **Parámetros de Query**: `lastSync?: string` (Timestamp ISO 8601 del último momento de sincronización del cliente).
    * **Response**: Objeto JSON que contiene arrays de las entidades de cada módulo. (HTTP 200 OK)
    * **Ejemplo de Request**:
        ```
        GET /api/sync/pull?lastSync=2024-06-19T10:30:00Z
        ```
    * **Ejemplo de Response**:
        ```json
        {
          "affiliates": [
            {
              "uuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
              "id": "AP-001",
              "first_name": "Juan",
              "last_name": "Perez",
              "ci": "1234567",
              "phone": "555-1234",
              "original_affiliate_name": "-",
              "current_affiliate_name": "-",
              "profile_photo_url": "[http://example.com/photo.jpg](http://example.com/photo.jpg)",
              "credential_photo_url": "[http://example.com/credential.jpg](http://example.com/credential.jpg)",
              "tags": ["activo", "directiva"],
              "total_paid": 100.50,
              "total_debt": 20.00,
              "created_at": "2023-10-27T10:00:00.000Z",
              "updated_at": "2024-06-20T09:00:00.000Z"
            }
          ],
          "users": [
            {
              "uuid": "u1v2w3x4-y5z6-7890-1234-567890abcdef",
              "user_name": "admin",
              "password": "hashedpassword",
              "email": "admin@example.com",
              "role": "admin",
              "created_at": "2024-01-01T00:00:00.000Z",
              "updated_at": "2024-06-20T09:30:00.000Z"
            }
          ],
          "fines": [
            {
              "uuid": "f1e2d3c4-b5a6-7890-1234-567890abcdef",
              "description": "Multa por retraso",
              "amount": 10,
              "date": "2024-06-15T14:30:00.000Z",
              "status": "pending",
              "affiliateId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
              "created_at": "2024-06-20T10:00:00.000Z",
              "updated_at": "2024-06-20T10:00:00.000Z"
            }
          ],
          "contributions": [
            {
              "id": 1,
              "name": "Cuota Mensual Enero",
              "description": "Cuota regular de enero",
              "date": "2024-01-01T00:00:00.000Z",
              "defaultAmount": 25,
              "isGeneral": true,
              "created_at": "2024-06-20T10:00:00.000Z",
              "updated_at": "2024-06-20T10:00:00.000Z",
              "links": [
                {
                  "contributionId": 1,
                  "affiliateUuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                  "amountToPay": 25,
                  "amountPaid": 25,
                  "isPaid": true
                }
              ]
            }
          ],
          "attendance": [
            {
              "id": 1,
              "name": "Asistencia Reunión General",
              "created_at": "2024-06-20T08:00:00.000Z",
              "status": "INICIADA",
              "updated_at": "2024-06-20T08:00:00.000Z",
              "records": [
                {
                  "id": 101,
                  "listId": 1,
                  "affiliateUuid": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                  "registeredAt": "2024-06-20T08:05:00.000Z",
                  "status": "PRESENTE"
                }
              ]
            }
          ]
        }
        ```

---

### 1.6. Módulo de Usuarios (`UsersModule`)

Gestiona la información de los usuarios del sistema (no afiliados).

#### 1.6.1. Entidad: `UserEntity` (`src/users/entities/user.entity.ts`)

Representa un usuario del sistema.

| Campo        | Tipo      | Descripción                             | Restricciones            |
| :----------- | :-------- | :-------------------------------------- | :----------------------- |
| `uuid`       | `string`  | Identificador único universal (Primary Key)| `@PrimaryColumn`, `UUID` |
| `user_name`  | `string`  | Nombre de usuario                       | `@Column`, `unique`      |
| `password`   | `string`  | Contraseña (debería ser hasheada)       | `@Column`                |
| `email`      | `string`  | Correo electrónico del usuario          | `@Column`, `unique`      |
| `role`       | `string`  | Rol del usuario (ej. 'admin', 'user')   | `@Column`                |
| `created_at` | `Date`    | Fecha de creación                       | `@CreateDateColumn`      |
| `updated_at` | `Date`    | Última fecha de actualización           | `@UpdateDateColumn`      |

#### 1.6.2. DTOs

* **`CreateUserDto`** (`src/users/dto/create-user.dto.ts`)
    Utilizado para la creación y actualización de usuarios.

    | Campo       | Tipo      | Descripción                             |
    | :---------- | :-------- | :-------------------------------------- |
    | `uuid`      | `string`  | UUID del usuario                        |
    | `user_name` | `string`  | Nombre de usuario                       |
    | `password`  | `string`  | Contraseña                              |
    | `email`     | `string`  | Correo electrónico                      |
    | `role`      | `string`  | Rol del usuario                         |

* **`UpdateUserDto`** (`src/users/dto/update-user.dto.ts`)
    Extiende `PartialType` de `CreateUserDto`.

#### 1.6.3. Servicios (`UsersService`)

* `upsert(userData: CreateUserDto): Promise<UserEntity>`: Crea un nuevo usuario o actualiza uno existente. Incluye validación para evitar nombres de usuario o correos electrónicos duplicados.
* `remove(uuid: string): Promise<void>`: Elimina un usuario por su `uuid`. Lanza `NotFoundException` si no se encuentra.
* `findAll(): Promise<UserEntity[]>`: Retorna todos los usuarios.
* `validateUser(user_name: string, pass: string): Promise<any>`: Valida las credenciales de un usuario. (Nota: En una aplicación real, la contraseña se compararía con un hash).

#### 1.6.4. Endpoints (`UsersController`)

**Base URL**: `/api/users`

* **`POST /api/users`**
    * **Descripción**: Crea o actualiza un usuario.
    * **Request Body**: `CreateUserDto`
    * **Response**: `UserEntity` (HTTP 200 OK)
    * **Errores**: `ConflictException` (HTTP 409 Conflict) si el nombre de usuario o correo electrónico ya están en uso.
    * **Ejemplo de Request Body**:
        ```json
        {
          "uuid": "u1v2w3x4-y5z6-7890-1234-567890abcdef",
          "user_name": "newuser",
          "password": "securepassword123",
          "email": "newuser@example.com",
          "role": "user"
        }
        ```
    * **Ejemplo de Response**:
        ```json
        {
          "uuid": "u1v2w3x4-y5z6-7890-1234-567890abcdef",
          "user_name": "newuser",
          "password": "securepassword123",
          "email": "newuser@example.com",
          "role": "user",
          "created_at": "2024-06-20T10:00:00.000Z",
          "updated_at": "2024-06-20T10:00:00.000Z"
        }
        ```

* **`PATCH /api/users/:uuid`**
    * **Descripción**: Actualiza un usuario existente.
    * **Parámetros de Ruta**: `uuid: string` (UUID del usuario, aunque la lógica usa el UUID del cuerpo).
    * **Request Body**: `CreateUserDto`
    * **Response**: `UserEntity` (HTTP 200 OK)
    * **Errores**: `ConflictException` (HTTP 409 Conflict) si el nombre de usuario o correo electrónico ya están en uso.

* **`DELETE /api/users/:uuid`**
    * **Descripción**: Elimina un usuario por su UUID.
    * **Parámetros de Ruta**: `uuid: string` (UUID del usuario a eliminar).
    * **Response**: (HTTP 204 No Content)
    * **Errores**: `NotFoundException` (HTTP 404 Not Found) si el usuario no existe.

* **`GET /api/users`**
    * **Descripción**: Obtiene una lista de todos los usuarios.
    * **Response**: `UserEntity[]` (HTTP 200 OK)

---

## 2. Configuración General de la Aplicación

### 2.1. `AppModule` (`src/app.module.ts`)

El módulo raíz de la aplicación.

* **`ConfigModule`**: Se usa para cargar variables de entorno, haciéndolas disponibles globalmente.
* **`TypeOrmModule.forRootAsync`**: Configuración asíncrona de la conexión a la base de datos PostgreSQL.
    * Obtiene las credenciales de la base de datos de las variables de entorno (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`).
    * Configura `synchronize: true` para desarrollo (esto sincronizará automáticamente el esquema de la base de datos con las entidades TypeORM, **no recomendado para producción**).
    * En modo producción (`STAGE=prod`), añade configuración SSL para la conexión a la base de datos (ej. Neon).
* **Módulos Importados**: Integra todos los módulos de negocio (`AffiliatesModule`, `UsersModule`, `ContributionsModule`, `FinesModule`, `AttendanceModule`, `SyncModule`).

### 2.2. `main.ts` (`src/main.ts`)

Punto de entrada de la aplicación.

* Crea una instancia de la aplicación NestJS.
* La aplicación escucha en el puerto `3000`.

### 2.3. `AppService` (`src/app.service.ts`)

Un servicio básico que retorna un mensaje de "Hello World!".

### 2.4. `AppController` (`src/app.controller.ts`)

Un controlador básico que expone un endpoint raíz para el mensaje de "Hello World!".

* **`GET /`**
    * **Descripción**: Retorna un mensaje de bienvenida simple.
    * **Response**: `string` (HTTP 200 OK)
    * **Ejemplo de Response**:
        ```
        "Hello World!"
        ```

---