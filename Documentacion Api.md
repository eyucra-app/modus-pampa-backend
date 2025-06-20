# Backend API Documentation

This document provides a detailed overview of the backend API for your Flutter application. The backend is built with NestJS and TypeORM, using PostgreSQL as the database. It manages various aspects including affiliates, attendance records, contributions, fines, and user authentication, with a synchronization mechanism for data consistency.

## 1. Core Modules

The application is structured into several modules, each responsible for a specific domain.

### 1.1. Affiliates Module

Manages information about affiliates.

* **Entities**:
    * `AffiliateEntity`: Represents an affiliate in the database.
        * `uuid`: string (Primary Column, Unique)
        * `id`: string (Unique, e.g., 'AP-001')
        * `first_name`: string
        * `last_name`: string
        * `ci`: string (Unique)
        * `phone`: string (Nullable)
        * `original_affiliate_name`: string (Default: '-')
        * `current_affiliate_name`: string (Default: '-')
        * `profile_photo_url`: string (Nullable)
        * `credential_photo_url`: string (Nullable)
        * `tags`: string[] (Default: [])
        * `total_paid`: number (float, Default: 0.0)
        * `total_debt`: number (float, Default: 0.0)
        * `createdAt`: Date (Auto-generated timestamp)
        * `updatedAt`: Date (Auto-generated timestamp)

* **DTOs**:
    * `CreateAffiliateDto`: Used for creating or updating an affiliate.
        * `uuid`: string (IsUUID, IsNotEmpty)
        * `id`: string (IsString, IsNotEmpty)
        * `first_name`: string (IsString, IsNotEmpty)
        * `last_name`: string (IsString, IsNotEmpty)
        * `ci`: string (IsString, IsNotEmpty)
        * `phone`: string (IsOptional)
        * `original_affiliate_name`: string (IsOptional, Default: '-')
        * `current_affiliate_name`: string (IsOptional, Default: '-')
        * `profile_photo_url`: string (IsUrl, IsOptional)
        * `credential_photo_url`: string (IsUrl, IsOptional)
        * `tags`: string[] (IsArray, IsOptional, Default: [])
        * `total_paid`: number (IsNumber, IsOptional, Default: 0.0)
        * `total_debt`: number (IsNumber, IsOptional, Default: 0.0)
    * `UpdateAffiliateDto`: Extends `PartialType(CreateAffiliateDto)`, allowing partial updates.

* **Services**:
    * `AffiliatesService`: Handles the business logic for affiliates.
        * `upsert(affiliateData: CreateAffiliateDto)`: Creates a new affiliate or updates an existing one based on the UUID.
        * `remove(uuid: string)`: Deletes an affiliate by UUID. Throws `NotFoundException` if the affiliate is not found.
        * `findAll()`: Returns all affiliates.
        * `findOne(uuid: string)`: Returns a single affiliate by UUID. Throws `NotFoundException` if the affiliate is not found.

* **Controllers**:
    * `AffiliatesController`: Exposes RESTful endpoints for affiliate management under the `/api/affiliates` base path.
        * `POST /api/affiliates`
            * **Description**: Creates a new affiliate or updates an existing one (upsert operation).
            * **Request Body**: `CreateAffiliateDto`
            * **Response**: `AffiliateEntity` (the saved affiliate)
            * **Status Code**: `200 OK`
        * `PATCH /api/affiliates/:uuid`
            * **Description**: Updates an existing affiliate. Internally calls the `upsert` service method.
            * **Request Body**: `CreateAffiliateDto` (can be partial due to `PartialType` in `UpdateAffiliateDto` but the controller uses `CreateAffiliateDto` and relies on the service's upsert logic)
            * **Response**: `AffiliateEntity` (the updated affiliate)
            * **Status Code**: `200 OK`
        * `GET /api/affiliates`
            * **Description**: Retrieves all affiliates.
            * **Response**: `AffiliateEntity[]`
            * **Status Code**: `200 OK`
        * `GET /api/affiliates/:uuid`
            * **Description**: Retrieves a single affiliate by UUID.
            * **Path Params**: `uuid` (string)
            * **Response**: `AffiliateEntity`
            * **Status Code**: `200 OK`
        * `DELETE /api/affiliates/:uuid`
            * **Description**: Deletes an affiliate by UUID.
            * **Path Params**: `uuid` (string)
            * **Response**: No content.
            * **Status Code**: `204 No Content`

### 1.2. Attendance Module

Manages attendance lists and individual attendance records for affiliates.

* **Entities**:
    * `AttendanceListEntity`: Represents an attendance list.
        * `id`: number (Primary Generated Column)
        * `name`: string
        * `createdAt`: Date (timestamp with time zone)
        * `status`: string (e.g., 'PREPARADA', 'INICIADA')
        * `records`: `AttendanceRecordEntity[]` (One-to-Many relation, cascaded)
        * `updatedAt`: Date (Auto-generated timestamp)
    * `AttendanceRecordEntity`: Represents an individual attendance record for an affiliate within a list.
        * `id`: number (Primary Generated Column)
        * `listId`: number (Foreign Key to `AttendanceListEntity`)
        * `affiliateUuid`: string (Foreign Key to `AffiliateEntity`)
        * `registeredAt`: Date (timestamp with time zone)
        * `status`: string (e.g., 'PRESENTE', 'RETRASO')
        * `attendanceList`: `AttendanceListEntity` (Many-to-One relation)
        * `affiliate`: `AffiliateEntity` (Many-to-One relation)

* **DTOs**:
    * `AttendanceRecordDto`: Used for individual attendance records within a list.
        * `affiliateUuid`: string (IsUUID, IsNotEmpty)
        * `status`: string (IsString, IsNotEmpty)
        * `registeredAt`: string (IsDateString, IsNotEmpty)
    * `CreateAttendanceDto`: Used for creating or updating an attendance list.
        * `name`: string (IsString, IsNotEmpty)
        * `createdAt`: string (IsDateString, IsNotEmpty)
        * `status`: string (IsString, IsNotEmpty)
        * `records`: `AttendanceRecordDto[]` (IsArray, ValidateNested, Type(() => AttendanceRecordDto))
    * `UpdateAttendanceDto`: Extends `PartialType(CreateAttendanceDto)`.

* **Services**:
    * `AttendanceService`: Handles the business logic for attendance.
        * `upsert(createDto: CreateAttendanceDto, id?: number)`: Creates a new attendance list or updates an existing one. Manages associated attendance records within a transaction.
        * `findAll()`: Returns all attendance lists with their records.
        * `findOne(id: number)`: Returns a single attendance list by ID with its records and associated affiliate details. Throws `NotFoundException` if not found.
        * `remove(id: number)`: Deletes an attendance list by ID. Throws `NotFoundException` if not found.

* **Controllers**:
    * `AttendanceController`: Exposes RESTful endpoints for attendance management under the `/api/attendance` base path.
        * `POST /api/attendance`
            * **Description**: Creates a new attendance list with its records.
            * **Request Body**: `CreateAttendanceDto`
            * **Response**: `AttendanceListEntity` (the saved attendance list with records)
            * **Status Code**: `201 Created` (implicit, NestJS default for POST)
        * `PATCH /api/attendance/:id`
            * **Description**: Updates an existing attendance list and its records.
            * **Path Params**: `id` (number)
            * **Request Body**: `CreateAttendanceDto`
            * **Response**: `AttendanceListEntity` (the updated attendance list with records)
            * **Status Code**: `200 OK`
        * `GET /api/attendance`
            * **Description**: Retrieves all attendance lists with their records.
            * **Response**: `AttendanceListEntity[]`
            * **Status Code**: `200 OK`
        * `GET /api/attendance/:id`
            * **Description**: Retrieves a single attendance list by ID with its records and linked affiliate information.
            * **Path Params**: `id` (number)
            * **Response**: `AttendanceListEntity`
            * **Status Code**: `200 OK`
        * `DELETE /api/attendance/:id`
            * **Description**: Deletes an attendance list by ID.
            * **Path Params**: `id` (number)
            * **Response**: No content.
            * **Status Code**: `204 No Content`

### 1.3. Contributions Module

Manages contributions and their associated affiliate payment links.

* **Entities**:
    * `ContributionEntity`: Represents a contribution event.
        * `id`: number (Primary Generated Column)
        * `name`: string
        * `description`: string (Nullable)
        * `date`: Date (timestamp with time zone)
        * `defaultAmount`: number (float, column name `total_amount`)
        * `isGeneral`: boolean (Default: `true`, column name `is_general`)
        * `links`: `ContributionAffiliateLinkEntity[]` (One-to-Many relation, cascaded)
        * `createdAt`: Date (Auto-generated timestamp)
        * `updatedAt`: Date (Auto-generated timestamp)
    * `ContributionAffiliateLinkEntity`: Represents a link between a contribution and an affiliate, including payment details.
        * `contributionId`: number (Primary Column, Foreign Key to `ContributionEntity`)
        * `affiliateUuid`: string (Primary Column, Foreign Key to `AffiliateEntity`)
        * `amountToPay`: number (float)
        * `amountPaid`: number (float, Default: 0.0)
        * `isPaid`: boolean (Default: `false`)
        * `contribution`: `ContributionEntity` (Many-to-One relation)
        * `affiliate`: `AffiliateEntity` (Many-to-One relation)

* **DTOs**:
    * `ContributionAffiliateLinkDto`: Used for linking contributions to affiliates.
        * `affiliateUuid`: string (IsUUID)
        * `amountToPay`: number (IsNumber)
        * `amountPaid?`: number (IsNumber, IsOptional, Default: 0.0)
        * `isPaid?`: boolean (IsBoolean, IsOptional, Default: false)
    * `CreateContributionDto`: Used for creating or updating a contribution.
        * `name`: string (IsString, IsNotEmpty)
        * `description?`: string (IsOptional)
        * `date`: string (IsDateString)
        * `defaultAmount`: number (IsNumber)
        * `isGeneral?`: boolean (IsBoolean, IsOptional, Default: true)
        * `links`: `ContributionAffiliateLinkDto[]` (IsArray, ValidateNested, Type(() => ContributionAffiliateLinkDto))
    * `UpdateContributionDto`: Extends `PartialType(CreateContributionDto)`.

* **Services**:
    * `ContributionsService`: Handles the business logic for contributions.
        * `upsert(createDto: CreateContributionDto, id?: number)`: Creates or updates a contribution, including its associated affiliate links, within a transaction.
        * `findAll()`: Returns all contributions with their links.
        * `findOne(id: number)`: Returns a single contribution by ID with its links and associated affiliate details. Throws `NotFoundException` if not found.
        * `remove(id: number)`: Deletes a contribution by ID. Throws `NotFoundException` if not found.

* **Controllers**:
    * `ContributionsController`: Exposes RESTful endpoints for contribution management under the `/api/contributions` base path.
        * `POST /api/contributions`
            * **Description**: Creates a new contribution with its affiliate links.
            * **Request Body**: `CreateContributionDto`
            * **Response**: `ContributionEntity` (the saved contribution with links)
            * **Status Code**: `201 Created` (implicit)
        * `PATCH /api/contributions/:id`
            * **Description**: Updates an existing contribution and its affiliate links.
            * **Path Params**: `id` (number)
            * **Request Body**: `CreateContributionDto`
            * **Response**: `ContributionEntity` (the updated contribution with links)
            * **Status Code**: `200 OK`
        * `GET /api/contributions`
            * **Description**: Retrieves all contributions with their affiliate links.
            * **Response**: `ContributionEntity[]`
            * **Status Code**: `200 OK`
        * `GET /api/contributions/:id`
            * **Description**: Retrieves a single contribution by ID with its affiliate links and associated affiliate information.
            * **Path Params**: `id` (number)
            * **Response**: `ContributionEntity`
            * **Status Code**: `200 OK`
        * `DELETE /api/contributions/:id`
            * **Description**: Deletes a contribution by ID.
            * **Path Params**: `id` (number)
            * **Response**: No content.
            * **Status Code**: `204 No Content`

### 1.4. Fines Module

Manages fines issued to affiliates.

* **Entities**:
    * `FineEntity`: Represents a fine.
        * `uuid`: string (Primary Column)
        * `description`: string
        * `amount`: number (float)
        * `date`: Date (timestamp)
        * `status`: string (e.g., 'pending', 'paid')
        * `affiliateId`: string (Foreign Key to `AffiliateEntity` UUID)
        * `affiliate`: `AffiliateEntity` (Many-to-One relation)
        * `createdAt`: Date (Auto-generated timestamp)
        * `updatedAt`: Date (Auto-generated timestamp)

* **DTOs**:
    * `CreateFineDto`: Used for creating or updating a fine.
        * `uuid`: string (IsUUID, IsNotEmpty)
        * `description`: string (IsString, IsNotEmpty)
        * `amount`: number (IsNumber, IsPositive)
        * `date`: string (IsDateString)
        * `status`: string (IsString, IsNotEmpty)
        * `affiliateId`: string (IsUUID, IsNotEmpty)
    * `UpdateFineDto`: Extends `PartialType(CreateFineDto)`.

* **Services**:
    * `FinesService`: Handles the business logic for fines.
        * `upsert(fineData: CreateFineDto)`: Creates a new fine or updates an existing one based on the UUID.
        * `remove(uuid: string)`: Deletes a fine by UUID. Throws `NotFoundException` if not found.
        * `findAll()`: Returns all fines with their associated affiliate details.
        * `findByAffiliate(affiliateId: string)`: Returns all fines for a specific affiliate.

* **Controllers**:
    * `FinesController`: Exposes RESTful endpoints for fine management under the `/api/fines` base path.
        * `POST /api/fines`
            * **Description**: Creates a new fine or updates an existing one (upsert).
            * **Request Body**: `CreateFineDto`
            * **Response**: `FineEntity` (the saved fine)
            * **Status Code**: `200 OK`
        * `PATCH /api/fines/:uuid`
            * **Description**: Updates an existing fine. Internally calls the `upsert` service method.
            * **Request Body**: `CreateFineDto`
            * **Response**: `FineEntity` (the updated fine)
            * **Status Code**: `200 OK`
        * `DELETE /api/fines/:uuid`
            * **Description**: Deletes a fine by UUID.
            * **Path Params**: `uuid` (string)
            * **Response**: No content.
            * **Status Code**: `204 No Content`
        * `GET /api/fines`
            * **Description**: Retrieves all fines with their associated affiliate details.
            * **Response**: `FineEntity[]`
            * **Status Code**: `200 OK`
        * `GET /api/fines/by-affiliate/:affiliateId`
            * **Description**: Retrieves all fines for a specific affiliate.
            * **Path Params**: `affiliateId` (string, affiliate's UUID)
            * **Response**: `FineEntity[]`
            * **Status Code**: `200 OK`

### 1.5. Sync Module

Provides endpoints for data synchronization with client applications.

* **Entities**:
    * `Sync`: This appears to be a placeholder entity and doesn't represent a database table in the provided code.

* **DTOs**:
    * `CreateSyncDto`: Empty DTO.
    * `UpdateSyncDto`: Extends `PartialType(CreateSyncDto)`.

* **Services**:
    * `SyncService`: Handles the logic for pulling changes from the database.
        * `pullChanges(lastSyncTimestamp?: string)`: Fetches all data (affiliates, users, fines, contributions, attendance) that have been updated since a given `lastSyncTimestamp`. If no timestamp is provided, it fetches all data.

* **Controllers**:
    * `SyncController`: Exposes synchronization endpoints under the `/api/sync` base path.
        * `GET /api/sync/pull`
            * **Description**: Pulls all changes from the backend. Can be filtered by a `lastSync` timestamp to get only recent updates.
            * **Query Params**: `lastSync` (optional, string in ISO 8601 format)
            * **Response**: An object containing arrays of updated entities:
                ```json
                {
                  "affiliates": [
                    { /* AffiliateEntity object */ }
                  ],
                  "users": [
                    { /* UserEntity object */ }
                  ],
                  "fines": [
                    { /* FineEntity object */ }
                  ],
                  "contributions": [
                    { /* ContributionEntity object with 'links' relation */ }
                  ],
                  "attendance": [
                    { /* AttendanceListEntity object with 'records' relation */ }
                  ]
                }
                ```
            * **Status Code**: `200 OK`

### 1.6. Users Module

Manages user accounts.

* **Entities**:
    * `UserEntity`: Represents a user in the database.
        * `uuid`: string (Primary Column)
        * `username`: string (Unique)
        * `password`: string
        * `email`: string (Unique)
        * `role`: string
        * `createdAt`: Date (Auto-generated timestamp)
        * `updatedAt`: Date (Auto-generated timestamp)

* **DTOs**:
    * `CreateUserDto`: Used for creating or updating a user.
        * `uuid`: string (IsUUID, IsNotEmpty)
        * `username`: string (IsString, IsNotEmpty)
        * `password`: string (IsString, IsNotEmpty)
        * `email`: string (IsEmail, IsNotEmpty)
        * `role`: string (IsString, IsNotEmpty)
    * `UpdateUserDto`: Extends `PartialType(CreateUserDto)`.

* **Services**:
    * `UsersService`: Handles the business logic for users.
        * `upsert(userData: CreateUserDto)`: Creates a new user or updates an existing one based on the UUID. Includes checks for unique username and email to prevent conflicts.
        * `remove(uuid: string)`: Deletes a user by UUID. Throws `NotFoundException` if not found.
        * `findAll()`: Returns all users.
        * `validateUser(username: string, pass: string)`: Validates user credentials. (Note: Password hashing is commented out in the provided code, but recommended for production).

* **Controllers**:
    * `UsersController`: Exposes RESTful endpoints for user management under the `/api/users` base path.
        * `POST /api/users`
            * **Description**: Creates a new user or updates an existing one (upsert).
            * **Request Body**: `CreateUserDto`
            * **Response**: `UserEntity` (the saved user)
            * **Status Code**: `200 OK`
        * `PATCH /api/users/:uuid`
            * **Description**: Updates an existing user. Internally calls the `upsert` service method.
            * **Request Body**: `CreateUserDto`
            * **Response**: `UserEntity` (the updated user)
            * **Status Code**: `200 OK`
        * `DELETE /api/users/:uuid`
            * **Description**: Deletes a user by UUID.
            * **Path Params**: `uuid` (string)
            * **Response**: No content.
            * **Status Code**: `204 No Content`
        * `GET /api/users`
            * **Description**: Retrieves all users.
            * **Response**: `UserEntity[]`
            * **Status Code**: `200 OK`

## 2. Application Setup

* **`main.ts`**: The entry point of the NestJS application. It creates and starts the NestJS application, listening on port `3000`.
* **`app.module.ts`**: The root module that integrates all other modules.
    * Configures `ConfigModule` for environment variable loading (`.env` files).
    * Sets up `TypeOrmModule.forRootAsync` for database connection, allowing dynamic configuration based on environment variables (e.g., `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `STAGE`).
    * Includes conditional SSL configuration for production environments (e.g., Render/Neon).
    * Imports `AffiliatesModule`, `UsersModule`, `ContributionsModule`, `FinesModule`, `AttendanceModule`, and `SyncModule`.
* **`app.controller.ts`** and **`app.service.ts`**: Provide a basic root endpoint (`/`) that returns "Hello World!".

## 3. Database Interactions (TypeORM)

* **Entities**: Defined using `@Entity` and `@Column` decorators to map TypeScript classes to database tables and columns.
* **Repositories**: Injected into services using `@InjectRepository` to interact with database tables.
* **Transactions**: Used in `AttendanceService` and `ContributionsService` via `EntityManager` to ensure data consistency when saving or updating an entity and its related nested entities (e.g., `AttendanceListEntity` and `AttendanceRecordEntity`).
* **Relations**: Defined using `@OneToMany`, `@ManyToOne`, and `@JoinColumn` decorators to establish relationships between entities (e.g., an `AttendanceListEntity` has many `AttendanceRecordEntity` instances).
* **Upsert Logic**: The `save` method of TypeORM repositories is leveraged for "upsert" functionality (insert or update) when a primary key is provided. For entities with nested relations, a custom `upsert` logic is implemented to handle the deletion of old child records before inserting new ones.

## 4. Validation

* **`class-validator`**: Used in DTOs (`CreateAffiliateDto`, `CreateAttendanceDto`, etc.) with decorators like `@IsUUID`, `@IsString`, `@IsNotEmpty`, `@IsOptional`, `@IsNumber`, `@IsBoolean`, `@IsDateString`, `@IsUrl`, `@IsArray`, `@ValidateNested`, `@IsPositive`, `@IsEmail` to ensure incoming request data adheres to defined rules.
* **`ValidationPipe`**: Although not explicitly shown in `main.ts`, NestJS typically integrates `class-validator` automatically when `ValidationPipe` is configured globally, which applies these validation rules to incoming request bodies.

## 5. Error Handling

* **`NotFoundException`**: Thrown by services when an entity is not found during `findOne` or `remove` operations.
* **`ConflictException`**: Thrown by `UsersService` if a new user attempts to register with an existing username or email.