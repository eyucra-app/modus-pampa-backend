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