This document provides a detailed overview of the NestJS application, including its core structure, modules, entities, DTOs, services, controllers, endpoints, and database migrations.

-----

# NestJS Application Documentation

This document outlines the architecture and functionalities of the NestJS application.

## 1\. Core Application Structure

The core of the application handles the bootstrapping, global module configuration, and basic health checks.

### `src/main.ts`

This file is the entry point of the application. It creates the NestJS application instance and listens for incoming requests.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### `src/app.module.ts`

The root module of the application. It imports and configures other modules, including `TypeOrmModule` for database integration and `ConfigModule` for environment variable management.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ContributionsModule } from './contributions/contributions.module';
import { FinesModule } from './fines/fines.module';
import { SyncModule } from './sync/sync.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {

        const isProduction = configService.get<string>('STAGE') === 'prod';

        const dbConfig: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: +configService.get<string>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: !isProduction,
        };

        if (isProduction) {
            console.log('[DB] Conectando en modo de PRODUCCIÓN (Render/Neon)...');
            Object.assign(dbConfig, {
              ssl: {
                rejectUnauthorized: false,
              },
            });
        } else {
            console.log('[DB] Conectando en modo de DESARROLLO LOCAL...');
        }

        return dbConfig;
      },
    }),
    AffiliatesModule,
    UsersModule,
    ContributionsModule,
    FinesModule,
    AttendanceModule,
    SyncModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### `src/app.controller.ts`

A basic controller for the root path, demonstrating a simple "Hello World\!" endpoint.

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

### `src/app.service.ts`

Provides the business logic for the `AppController`.

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

### `src/datasource.ts`

Configures the TypeORM `DataSource` for database migrations. It loads environment variables and specifies entity and migration paths.

```typescript
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga las variables de .env

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { // Configuración para Neon
    rejectUnauthorized: false,
  },
  entities: ['dist/**/*.entity.js'], // Apunta a las entidades compiladas
  migrations: ['dist/db/migrations/*.js'], // Dónde buscar migraciones
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
```

-----

## 2\. Modules Details

The application is modularized, with each feature having its own set of controllers, services, entities, and DTOs.

### 2.1 Affiliates Module

Manages affiliate data, including creation, updates, retrieval, and deletion.

#### `src/affiliates/affiliates.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateEntity } from './entities/affiliate.entity';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AffiliateEntity]),
  ],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
})
export class AffiliatesModule {}
```

#### `src/affiliates/entities/affiliate.entity.ts`

Represents an affiliate in the database.

| Column Name             | Type               | Description                                   |
| :---------------------- | :----------------- | :-------------------------------------------- |
| `uuid`                  | `string`           | Primary key (UUID)                            |
| `id`                    | `string`           | Unique identifier like 'AP-001'               |
| `first_name`            | `string`           | Affiliate's first name                        |
| `last_name`             | `string`           | Affiliate's last name                         |
| `ci`                    | `string`           | Unique identification document (CI)           |
| `phone`                 | `string`           | Phone number (optional)                       |
| `original_affiliate_name` | `string`           | Original affiliate name (default '-')         |
| `current_affiliate_name` | `string`           | Current affiliate name (default '-')          |
| `profile_photo_url`     | `string`           | URL of profile photo (optional)               |
| `credential_photo_url`  | `string`           | URL of credential photo (optional)            |
| `tags`                  | `string` (`text`)  | JSON string of tags (default '[]')            |
| `total_paid`            | `number` (`float`) | Total amount paid by affiliate (default 0.0)  |
| `total_debt`            | `number` (`float`) | Total debt of affiliate (default 0.0)         |
| `created_at`            | `Date`             | Timestamp of creation                         |
| `updated_at`            | `Date`             | Timestamp of last update                      |

#### `src/affiliates/dto/create-affiliate.dto.ts`

DTO for creating or updating an affiliate.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, IsUrl } from 'class-validator';

export class CreateAffiliateDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  id: string; // ID único como 'AP-001'

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  ci: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  original_affiliate_name?: string = '-';

  @IsString()
  @IsOptional()
  current_affiliate_name?: string = '-';

  @IsUrl()
  @IsOptional()
  profile_photo_url?: string;

  @IsUrl()
  @IsOptional()
  credential_photo_url?: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsNumber()
  @IsOptional()
  total_paid?: number = 0.0;

  @IsNumber()
  @IsOptional()
  total_debt?: number = 0.0;
}
```

#### `src/affiliates/dto/update-affiliate.dto.ts`

DTO for partially updating an affiliate (inherits from `CreateAffiliateDto`).

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateAffiliateDto } from './create-affiliate.dto';

export class UpdateAffiliateDto extends PartialType(CreateAffiliateDto) {}
```

#### `src/affiliates/affiliates.service.ts`

Handles the business logic for affiliates, interacting with the `AffiliateEntity` repository.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { AffiliateEntity } from './entities/affiliate.entity';

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(AffiliateEntity)
    private readonly affiliatesRepository: Repository<AffiliateEntity>,
  ) {}

  async upsert(affiliateData: CreateAffiliateDto): Promise<AffiliateEntity> {
    const affiliate = this.affiliatesRepository.create(affiliateData);
    return this.affiliatesRepository.save(affiliate);
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.affiliatesRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Afiliado con UUID '${uuid}' no encontrado.`);
    }
  }

  findAll(): Promise<AffiliateEntity[]> {
    return this.affiliatesRepository.find();
  }

  async findOne(uuid: string): Promise<AffiliateEntity> {
    const affiliate = await this.affiliatesRepository.findOneBy({ uuid });
    if (!affiliate) {
      throw new NotFoundException(`Afiliado con UUID '${uuid}' no encontrado.`);
    }
    return affiliate;
  }
}
```

#### `src/affiliates/affiliates.controller.ts`

Defines the API endpoints for managing affiliates. The base route is `/api/affiliates`.

| Method | Path             | Request Body       | Response Type    | Description                               |
| :----- | :--------------- | :----------------- | :--------------- | :---------------------------------------- |
| `POST` | `/api/affiliates` | `CreateAffiliateDto` | `AffiliateEntity` | Creates or updates an affiliate (upsert). |
| `PUT`  | `/api/affiliates/:uuid` | `CreateAffiliateDto` | `AffiliateEntity` | Updates an affiliate.                     |
| `PATCH`| `/api/affiliates/:uuid` | `CreateAffiliateDto` | `AffiliateEntity` | Updates an affiliate.                     |
| `GET`  | `/api/affiliates` | None               | `AffiliateEntity[]` | Retrieves all affiliates.                 |
| `GET`  | `/api/affiliates/:uuid` | None               | `AffiliateEntity` | Retrieves a single affiliate by UUID.     |
| `DELETE`| `/api/affiliates/:uuid` | None               | `204 No Content`  | Deletes an affiliate by UUID.             |

-----

### 2.2 Attendance Module

Manages attendance lists and records.

#### `src/attendance/attendance.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceListEntity } from './entities/attendance-list.entity';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceListEntity,
      AttendanceRecordEntity,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
```

#### `src/attendance/entities/attendance-list.entity.ts`

Represents an attendance list.

| Column Name    | Type             | Description                                   |
| :------------- | :--------------- | :-------------------------------------------- |
| `id`           | `number`         | Primary generated ID                          |
| `name`         | `string`         | Name of the attendance list                   |
| `created_at`   | `Date`           | Timestamp of creation                         |
| `status`       | `string`         | Status of the list (e.g., 'PREPARADA')        |
| `updated_at`   | `Date`           | Timestamp of last update                      |
| `records`      | `AttendanceRecordEntity[]` | One-to-many relationship with attendance records |

#### `src/attendance/entities/attendance-record.entity.ts`

Represents an attendance record within a list.

| Column Name    | Type             | Description                                   |
| :------------- | :--------------- | :-------------------------------------------- |
| `id`           | `number`         | Primary generated ID                          |
| `list_id`      | `number`         | Foreign key to `AttendanceListEntity`         |
| `affiliate_uuid` | `string`         | Foreign key to `AffiliateEntity` (UUID)       |
| `registered_at`| `Date`           | Timestamp of registration                     |
| `status`       | `string`         | Attendance status (e.g., 'PRESENTE')          |
| `created_at`   | `Date`           | Timestamp of creation                         |
| `updated_at`   | `Date`           | Timestamp of last update                      |
| `attendanceList` | `AttendanceListEntity` | Many-to-one relationship with attendance list |
| `affiliate`    | `AffiliateEntity` | Many-to-one relationship with affiliate       |

#### `src/attendance/dto/attendance-record.dto.ts`

DTO for an individual attendance record.

```typescript
import { IsUUID, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class AttendanceRecordDto {
  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  @IsNotEmpty()
  registered_at: string;
}
```

#### `src/attendance/dto/create-attendance.dto.ts`

DTO for creating or updating an attendance list, including its records.

```typescript
import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceRecordDto } from './attendance-record.dto';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  created_at: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
```

#### `src/attendance/dto/update-attendance.dto.ts`

DTO for partially updating an attendance list (inherits from `CreateAttendanceDto`).

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
```

#### `src/attendance/attendance.service.ts`

Handles the business logic for attendance lists and records, including transactional upsert operations.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceListEntity } from './entities/attendance-list.entity';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceListEntity)
    private readonly listsRepository: Repository<AttendanceListEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async upsert(createDto: CreateAttendanceDto, id?: number): Promise<AttendanceListEntity> {
    return this.entityManager.transaction(async transactionalEntityManager => {
      const { records, ...mainData } = createDto;

      const listData = {
          ...mainData,
          created_at: new Date(mainData.created_at),
      };

      if (id) {
        await transactionalEntityManager.update(AttendanceListEntity, id, listData);
      }

      const list = id
        ? await transactionalEntityManager.findOneByOrFail(AttendanceListEntity, { id })
        : await transactionalEntityManager.save(AttendanceListEntity, listData);

      if (id) {
          await transactionalEntityManager.delete(AttendanceRecordEntity, { listId: id });
      }

      if (records && records.length > 0) {
        const recordEntities = records.map(recordDto => {
          return transactionalEntityManager.create(AttendanceRecordEntity, {
            ...recordDto,
            listId: list.id,
            registeredAt: new Date(recordDto.registered_at),
          });
        });
        await transactionalEntityManager.save(recordEntities);
      }

      return transactionalEntityManager.findOne(AttendanceListEntity, {
          where: { id: list.id },
          relations: ['records', 'records.affiliate']
      });
    });
  }

  findAll(): Promise<AttendanceListEntity[]> {
    return this.listsRepository.find({ relations: ['records'] });
  }

  async findOne(id: number): Promise<AttendanceListEntity> {
    const list = await this.listsRepository.findOne({
      where: { id },
      relations: ['records', 'records.affiliate'],
    });
    if (!list) {
      throw new NotFoundException(`Lista de asistencia con ID ${id} no encontrada.`);
    }
    return list;
  }

  async remove(id: number): Promise<void> {
    const result = await this.listsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lista de asistencia con ID ${id} no encontrada.`);
    }
  }
}
```

#### `src/attendance/attendance.controller.ts`

Defines the API endpoints for managing attendance. The base route is `/api/attendance`.

| Method | Path               | Request Body           | Response Type          | Description                         |
| :----- | :----------------- | :--------------------- | :--------------------- | :---------------------------------- |
| `POST` | `/api/attendance`  | `CreateAttendanceDto`  | `AttendanceListEntity` | Creates a new attendance list.      |
| `PATCH`| `/api/attendance/:id` | `CreateAttendanceDto`  | `AttendanceListEntity` | Updates an attendance list by ID.   |
| `GET`  | `/api/attendance`  | None                   | `AttendanceListEntity[]` | Retrieves all attendance lists.     |
| `GET`  | `/api/attendance/:id` | None                   | `AttendanceListEntity` | Retrieves an attendance list by ID. |
| `DELETE`| `/api/attendance/:id` | None                   | `204 No Content`       | Deletes an attendance list by ID.   |

-----

### 2.3 Contributions Module

Manages contributions and their associated affiliate links.

#### `src/contributions/contributions.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { ContributionAffiliateLinkEntity } from './entities/contribution-affiliate-link.entity';
import { ContributionEntity } from './entities/contribution.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContributionEntity,
      ContributionAffiliateLinkEntity,
    ]),
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
})
export class ContributionsModule {}
```

#### `src/contributions/entities/contribution.entity.ts`

Represents a contribution.

| Column Name    | Type               | Description                                   |
| :------------- | :----------------- | :-------------------------------------------- |
| `uuid`         | `string`           | Primary generated UUID                        |
| `name`         | `string`           | Name of the contribution                      |
| `description`  | `string`           | Optional description                          |
| `date`         | `Date`             | Date of the contribution                      |
| `default_amount`| `number` (`float`) | Default amount for the contribution           |
| `is_general`   | `boolean`          | Indicates if it's a general contribution      |
| `links`        | `ContributionAffiliateLinkEntity[]` | One-to-many relationship with affiliate links |
| `created_at`   | `Date`             | Timestamp of creation                         |
| `updated_at`   | `Date`             | Timestamp of last update                      |

#### `src/contributions/entities/contribution-affiliate-link.entity.ts`

Represents a link between a contribution and an affiliate.

| Column Name    | Type               | Description                                   |
| :------------- | :----------------- | :-------------------------------------------- |
| `uuid`         | `string` (`uuid`)  | Primary key (UUID)                            |
| `contribution_uuid` | `string` (`uuid`)  | Foreign key to `ContributionEntity`           |
| `affiliate_uuid` | `string` (`uuid`)  | Foreign key to `AffiliateEntity`              |
| `amount_to_pay`| `number` (`float`) | Amount the affiliate needs to pay             |
| `amount_paid`  | `number` (`float`) | Amount paid by the affiliate (default 0.0)    |
| `is_paid`      | `boolean`          | Payment status (default `false`)              |
| `created_at`   | `Date`             | Timestamp of creation                         |
| `updated_at`   | `Date`             | Timestamp of last update                      |
| `contribution` | `ContributionEntity` | Many-to-one relationship with contribution    |
| `affiliate`    | `AffiliateEntity`  | Many-to-one relationship with affiliate       |

#### `src/contributions/dto/contribution-affiliate-link.dto.ts`

DTO for creating or updating a contribution-affiliate link.

```typescript
import { IsUUID, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class ContributionAffiliateLinkDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsUUID()
  affiliate_uuid: string;

  @IsNumber()
  amount_to_pay: number;

  @IsNumber()
  @IsOptional()
  amount_paid?: number = 0.0;

  @IsBoolean()
  @IsOptional()
  is_paid?: boolean = false;
}
```

#### `src/contributions/dto/create-contribution.dto.ts`

DTO for creating a new contribution, including its associated links.

```typescript
import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ContributionAffiliateLinkDto } from './contribution-affiliate-link.dto';

export class CreateContributionDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsNumber()
  default_amount: number;

  @IsBoolean()
  @IsOptional()
  is_general?: boolean = true;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContributionAffiliateLinkDto)
  links: ContributionAffiliateLinkDto[];
}
```

#### `src/contributions/dto/update-contribution-link.dto.ts`

DTO for updating an existing contribution-affiliate link.

```typescript
// src/contributions/dto/update-contribution-link.dto.ts
import { IsNotEmpty, IsNumber, IsBoolean, IsInt, IsUUID } from 'class-validator';

export class UpdateContributionLinkDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsUUID()
  @IsNotEmpty()
  contribution_uuid: string;

  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string;

  @IsNumber()
  amount_paid: number;

  @IsBoolean()
  is_paid: boolean;
}
```

#### `src/contributions/dto/update-contribution.dto.ts`

DTO for partially updating a contribution (inherits from `CreateContributionDto`).

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateContributionDto } from './create-contribution.dto';

export class UpdateContributionDto extends PartialType(CreateContributionDto) {}
```

#### `src/contributions/contributions.service.ts`

Handles the business logic for contributions and their links.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ContributionEntity } from './entities/contribution.entity';
import { ContributionAffiliateLinkEntity } from './entities/contribution-affiliate-link.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionLinkDto } from './dto/update-contribution-link.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionEntity)
    private readonly contributionsRepository: Repository<ContributionEntity>,
    @InjectRepository(ContributionAffiliateLinkEntity)
    private readonly linksRepository: Repository<ContributionAffiliateLinkEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async upsert(createDto: CreateContributionDto): Promise<ContributionEntity> {
    const { links, ...mainData } = createDto;

    let contribution = await this.contributionsRepository.findOneBy({ uuid: mainData.uuid });

    if (contribution) {
      contribution = this.contributionsRepository.merge(contribution, {
        ...mainData,
        date: new Date(mainData.date),
      });
    } else {
      contribution = this.contributionsRepository.create({
        ...mainData,
        date: new Date(mainData.date),
      });
    }

    const savedContribution = await this.contributionsRepository.save(contribution);

    await this.linksRepository.delete({ contribution_uuid: savedContribution.uuid });

    if (links && links.length > 0) {
      const linkEntities = links.map(linkDto => {
        return this.linksRepository.create({
          ...linkDto,
          contribution_uuid: savedContribution.uuid,
        });
      });
      await this.linksRepository.save(linkEntities);
    }

    return this.findOne(savedContribution.uuid);
  }

  async updateLink(updateLinkDto: UpdateContributionLinkDto): Promise<ContributionAffiliateLinkEntity> {
    const { contribution_uuid, affiliate_uuid, ...updateData } = updateLinkDto;

    const link = await this.linksRepository.preload({
      contribution_uuid,
      affiliate_uuid,
      ...updateData,
    });

    if (!link) {
      throw new NotFoundException(`Enlace de aporte no encontrado para el afiliado ${affiliate_uuid}`);
    }

    return this.linksRepository.save(link);
  }

  findAll(): Promise<ContributionEntity[]> {
    return this.contributionsRepository.find({ relations: ['links'] });
  }

  async findOne(uuid: string): Promise<ContributionEntity> {
    const contribution = await this.contributionsRepository.findOne({
      where: { uuid },
      relations: ['links', 'links.affiliate'],
    });
    if (!contribution) {
      throw new NotFoundException(`Aporte con UUID ${uuid} no encontrado.`);
    }
    return contribution;
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.contributionsRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Aporte con UUID ${uuid} no encontrado.`);
    }
  }
}
```

#### `src/contributions/contributions.controller.ts`

Defines the API endpoints for managing contributions. The base route is `/api/contributions`.

| Method | Path                  | Request Body            | Response Type         | Description                               |
| :----- | :-------------------- | :---------------------- | :-------------------- | :---------------------------------------- |
| `POST` | `/api/contributions`  | `CreateContributionDto` | `ContributionEntity`  | Creates or updates a contribution.        |
| `PATCH`| `/api/contributions/:uuid` | `CreateContributionDto` | `ContributionEntity`  | Updates a contribution by UUID.           |
| `PUT`  | `/api/contributions/link` | `UpdateContributionLinkDto` | `ContributionAffiliateLinkEntity` | Updates a contribution affiliate link.    |
| `GET`  | `/api/contributions`  | None                    | `ContributionEntity[]` | Retrieves all contributions.              |
| `GET`  | `/api/contributions/:uuid` | None                    | `ContributionEntity`  | Retrieves a single contribution by UUID.  |
| `DELETE`| `/api/contributions/:uuid` | None                    | `204 No Content`      | Deletes a contribution by UUID.           |

-----

### 2.4 Fines Module

Manages fine records.

#### `src/fines/fines.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FineEntity } from './entities/fine.entity';
import { FinesController } from './fines.controller';
import { FinesService } from './fines.service';

@Module({
  imports: [TypeOrmModule.forFeature([FineEntity])],
  controllers: [FinesController],
  providers: [FinesService],
})
export class FinesModule {}
```

#### `src/fines/entities/fine.entity.ts`

Represents a fine in the database.

| Column Name    | Type               | Description                                   |
| :------------- | :----------------- | :-------------------------------------------- |
| `uuid`         | `string`           | Primary key (UUID)                            |
| `description`  | `string`           | Description of the fine                       |
| `amount`       | `number` (`float`) | Amount of the fine                            |
| `date`         | `Date`             | Date the fine was issued                      |
| `is_paid`      | `boolean`          | Payment status of the fine (default `false`)|
| `category`     | `string`           | Category of the fine (default 'Varios')       |
| `affiliate_uuid` | `string`           | Foreign key to `AffiliateEntity` (UUID)       |
| `affiliate`    | `AffiliateEntity`  | Many-to-one relationship with affiliate       |
| `created_at`   | `Date`             | Timestamp of creation                         |
| `updated_at`   | `Date`             | Timestamp of last update                      |

#### `src/fines/dto/create-fine.dto.ts`

DTO for creating a new fine.

```typescript
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsDateString, IsPositive, IsBoolean, IsOptional } from 'class-validator';

export class CreateFineDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsBoolean()
  @IsOptional()
  is_paid?: boolean;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string;
}
```

#### `src/fines/dto/update-fine.dto.ts`

DTO for partially updating a fine (inherits from `CreateFineDto`).

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateFineDto } from './create-fine.dto';

export class UpdateFineDto extends PartialType(CreateFineDto) {}
```

#### `src/fines/fines.service.ts`

Handles the business logic for fines.

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FineEntity } from './entities/fine.entity';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(FineEntity)
    private readonly finesRepository: Repository<FineEntity>,
  ) {}

  async upsert(fineData: CreateFineDto): Promise<FineEntity> {
    const fine = this.finesRepository.create({
        ...fineData,
        date: new Date(fineData.date)
    });
    return this.finesRepository.save(fine);
  }

  async update(uuid: string, updateData: UpdateFineDto): Promise<FineEntity> {
    const fine = await this.finesRepository.preload({
      uuid: uuid,
      ...updateData,
      ...(updateData.date && { date: new Date(updateData.date) }),
    });

    if (!fine) {
      throw new NotFoundException(`Multa con UUID '${uuid}' no encontrada.`);
    }
    return this.finesRepository.save(fine);
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.finesRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Multa con UUID '${uuid}' no encontrada.`);
    }
  }

  findAll(): Promise<FineEntity[]> {
    return this.finesRepository.find({ relations: ['affiliate'] });
  }

  findByAffiliate(affiliateId: string): Promise<FineEntity[]> {
      return this.finesRepository.findBy({ affiliate_uuid: affiliateId });
  }
}
```

#### `src/fines/fines.controller.ts`

Defines the API endpoints for managing fines. The base route is `/api/fines`.

| Method | Path                | Request Body   | Response Type  | Description                                 |
| :----- | :------------------ | :------------- | :------------- | :------------------------------------------ |
| `POST` | `/api/fines`        | `CreateFineDto`| `FineEntity`   | Creates or updates a fine (upsert).         |
| `PUT`  | `/api/fines/:uuid`  | `UpdateFineDto`| `FineEntity`   | Updates a fine by UUID.                     |
| `PATCH`| `/api/fines/:uuid`  | `UpdateFineDto`| `FineEntity`   | Updates a fine by UUID.                     |
| `DELETE`| `/api/fines/:uuid`  | None           | `204 No Content`| Deletes a fine by UUID.                     |
| `GET`  | `/api/fines`        | None           | `FineEntity[]` | Retrieves all fines.                        |
| `GET`  | `/api/fines/by-affiliate/:affiliateId` | None           | `FineEntity[]` | Retrieves all fines for a specific affiliate. |

-----

### 2.5 Sync Module

Handles data synchronization for various entities.

#### `src/sync/sync.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';
import { AttendanceListEntity } from 'src/attendance/entities/attendance-list.entity';
import { ContributionEntity } from 'src/contributions/entities/contribution.entity';
import { FineEntity } from 'src/fines/entities/fine.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AffiliateEntity,
      UserEntity,
      FineEntity,
      ContributionEntity,
      AttendanceListEntity,
    ]),
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
```

#### `src/sync/entities/sync.entity.ts`

This is an empty class and likely a placeholder or not actively used as a TypeORM entity.

```typescript
export class Sync {}
```

#### `src/sync/dto/create-sync.dto.ts`

This is an empty class and likely a placeholder.

```typescript
export class CreateSyncDto {}
```

#### `src/sync/dto/update-sync.dto.ts`

This is an empty class and likely a placeholder.

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateSyncDto } from './create-sync.dto';

export class UpdateSyncDto extends PartialType(CreateSyncDto) {}
```

#### `src/sync/sync.service.ts`

Provides a `pullChanges` method to retrieve data from different entities based on a `lastSyncTimestamp`.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';
import { AttendanceListEntity } from 'src/attendance/entities/attendance-list.entity';
import { ContributionEntity } from 'src/contributions/entities/contribution.entity';
import { FineEntity } from 'src/fines/entities/fine.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository, MoreThan } from 'typeorm';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(AffiliateEntity) private affiliatesRepo: Repository<AffiliateEntity>,
    @InjectRepository(UserEntity) private usersRepo: Repository<UserEntity>,
    @InjectRepository(FineEntity) private finesRepo: Repository<FineEntity>,
    @InjectRepository(ContributionEntity) private contributionsRepo: Repository<ContributionEntity>,
    @InjectRepository(AttendanceListEntity) private attendanceRepo: Repository<AttendanceListEntity>,
  ) {}

  async pullChanges(lastSyncTimestamp?: string) {
    const queryOptions = lastSyncTimestamp
      ? { where: { updated_at: MoreThan(new Date(lastSyncTimestamp)) } }
      : {};

    const fineQueryOptions = { ...queryOptions, relations: ['affiliate'] };
    const contributionQueryOptions = { ...queryOptions, relations: ['links'] };
    const attendanceQueryOptions = { ...queryOptions, relations: ['records'] };

    const [affiliates, users, fines, contributions, attendance] = await Promise.all([
      this.affiliatesRepo.find(queryOptions),
      this.usersRepo.find(queryOptions),
      this.finesRepo.find(fineQueryOptions),
      this.contributionsRepo.find(contributionQueryOptions),
      this.attendanceRepo.find(attendanceQueryOptions),
    ]);

    return { affiliates, users, fines, contributions, attendance };
  }
}
```

#### `src/sync/sync.controller.ts`

Defines the API endpoints for synchronization. The base route is `/api/sync`.

| Method | Path             | Query Parameters        | Response Type       | Description                                 |
| :----- | :--------------- | :---------------------- | :------------------ | :------------------------------------------ |
| `GET`  | `/api/sync/pull` | `lastSync` (optional) | `{ affiliates: AffiliateEntity[], users: UserEntity[], fines: FineEntity[], contributions: ContributionEntity[], attendance: AttendanceListEntity[] }` | Pulls changes for various entities since the last synchronization timestamp. |

-----

### 2.6 Users Module

Manages user data, including creation, updates, retrieval, and deletion.

#### `src/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

#### `src/users/entities/user.entity.ts`

Represents a user in the database.

| Column Name    | Type               | Description                                   |
| :------------- | :----------------- | :-------------------------------------------- |
| `uuid`         | `string`           | Primary key (UUID)                            |
| `user_name`    | `string`           | Unique username                               |
| `password_hash`| `string`           | Hashed password                               |
| `email`        | `string`           | Unique email address                          |
| `role`         | `string`           | User role                                     |
| `created_at`   | `Date`             | Timestamp of creation                         |
| `updated_at`   | `Date`             | Timestamp of last update                      |

#### `src/users/dto/create-user.dto.ts`

DTO for creating a new user.

```typescript
import { IsString, IsNotEmpty, IsUUID, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsString()
  @IsNotEmpty()
  password_hash: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
```

#### `src/users/dto/update-user.dto.ts`

DTO for partially updating a user (inherits from `CreateUserDto`).

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

#### `src/users/users.service.ts`

Handles the business logic for users.

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async upsert(userData: CreateUserDto): Promise<UserEntity> {
    const existing = await this.usersRepository.findOne({ where: { user_name: userData.user_name } });
    if (existing && existing.uuid !== userData.uuid) {
      throw new ConflictException(`El nombre de usuario '${userData.user_name}' ya está en uso.`);
    }

    const existingByEmail = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existingByEmail && existingByEmail.uuid !== userData.uuid) {
        throw new ConflictException(`El correo electrónico '${userData.email}' ya está en uso.`);
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.usersRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con UUID '${uuid}' no encontrado.`);
    }
  }

  findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async validateUser(user_name: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({ user_name });
    if (user && user.password_hash === pass) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async update(uuid: string, updateData: UpdateUserDto): Promise<UserEntity> {
    const user = await this.usersRepository.preload({
      uuid: uuid,
      ...updateData,
    });

    if (!user) {
      throw new NotFoundException(`Usuario con UUID '${uuid}' no encontrado.`);
    }
    return this.usersRepository.save(user);
  }
}
```

#### `src/users/users.controller.ts`

Defines the API endpoints for managing users. The base route is `/api/users`.

| Method | Path             | Request Body   | Response Type | Description                               |
| :----- | :--------------- | :------------- | :------------ | :---------------------------------------- |
| `POST` | `/api/users`     | `CreateUserDto`| `UserEntity`  | Creates or updates a user (upsert).       |
| `PUT`  | `/api/users/:uuid` | `UpdateUserDto`| `UserEntity`  | Updates a user by UUID.                   |
| `PATCH`| `/api/users/:uuid` | `UpdateUserDto`| `UserEntity`  | Updates a user by UUID.                   |
| `DELETE`| `/api/users/:uuid` | None           | `204 No Content` | Deletes a user by UUID.                   |
| `GET`  | `/api/users`     | None           | `UserEntity[]`| Retrieves all users.                      |

-----

## 3\. Database Migrations

The `src/db/migrations` directory contains TypeORM migration files that manage schema changes in the database. Each file represents a specific change.

  * **`1750712982559-AlignAttendanceModuleToSnakeCase.ts`**: Renames `affiliateId` to `affiliate_uuid` in the `fines` table and adds `created_at` and `updated_at` columns to `attendance_records`.
  * **`1750729429986-RefactorFinesStatusToIsPaid.ts`**: Renames the `status` column to `is_paid` in the `fines` table and changes its type to boolean.
  * **`1750732228896-AddCategoryToFines.ts`**: Adds a `category` column with a default value to the `fines` table.
  * **`1750734911431-RenameUserPasswordToHash.ts`**: Renames the `password` column to `password_hash` in the `users` table.
  * **`1750738966571-ChangeAffiliateTagsToString.ts`**: Sets a default empty array string `[]` for the `tags` column in the `affiliates` table.
  * **`1750807329215-RefactorContributionLinks.ts`**: Refactors the `contribution_affiliates` table, introducing a UUID primary key, renaming columns, and updating foreign key relationships.
  * **`1750865457162-RemoveAffiliateLinkIdAndSetUuid.ts`**: Modifies the `contributions` table by changing its primary key from `id` to `uuid` and ensuring `uuid` is a `SERIAL` (auto-incrementing) column, and updates the foreign key in `contribution_affiliates` to reference the new `uuid` in `contributions`.

-----