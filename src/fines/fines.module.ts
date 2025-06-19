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