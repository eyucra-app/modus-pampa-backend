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
      isGlobal: true, // Hace que ConfigModule esté disponible en toda la app
    }),
    // 2. Configuración asíncrona de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],  
      useFactory: (configService: ConfigService) => {
        
        const isProduction = configService.get<string>('STAGE') === 'prod';

        // Objeto de configuración base para ambos entornos
        // Se añade el tipo explícito para solucionar el error de TypeScript
        const dbConfig: TypeOrmModuleOptions = { 
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: +configService.get<string>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          // Sincroniza solo si NO es producción
          //synchronize: !isProduction, 
          synchronize: true, 
        };

        if (isProduction) {
            console.log('[DB] Conectando en modo de PRODUCCIÓN (Render/Neon)...');
            // Añade la configuración SSL requerida para producción en Neon
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
    //Añade aquí tus módulos
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