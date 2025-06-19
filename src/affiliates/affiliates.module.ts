import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateEntity } from './entities/affiliate.entity';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';

@Module({
  imports: [
    // Esto hace que el repositorio de AffiliateEntity esté disponible
    // para ser inyectado en AffiliatesService.
    TypeOrmModule.forFeature([AffiliateEntity]),
  ],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
})
export class AffiliatesModule {}