import { Module } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './entities/configuration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuration])], // Se importa la entidad
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService], // Se exporta el servicio para que otros módulos puedan usarlo
})
export class ConfigurationModule {}