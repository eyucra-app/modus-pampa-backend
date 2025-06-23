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
      // Usamos las nuevas opciones para la consulta de multas
      this.finesRepo.find(fineQueryOptions),
      this.contributionsRepo.find(contributionQueryOptions),
      this.attendanceRepo.find(attendanceQueryOptions),
    ]);

    return { affiliates, users, fines, contributions, attendance };
  }
}