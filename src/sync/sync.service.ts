import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';
import { AttendanceListEntity } from 'src/attendance/entities/attendance-list.entity';
import { ContributionEntity } from 'src/contributions/entities/contribution.entity';
import { FineEntity } from 'src/fines/entities/fine.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Configuration } from 'src/configuration/entities/configuration.entity';
import { Repository, MoreThan, FindOptionsWhere } from 'typeorm';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(AffiliateEntity) private affiliatesRepo: Repository<AffiliateEntity>,
    @InjectRepository(UserEntity) private usersRepo: Repository<UserEntity>,
    @InjectRepository(FineEntity) private finesRepo: Repository<FineEntity>,
    @InjectRepository(ContributionEntity) private contributionsRepo: Repository<ContributionEntity>,
    @InjectRepository(AttendanceListEntity) private attendanceRepo: Repository<AttendanceListEntity>,
    @InjectRepository(Configuration) private configurationRepo: Repository<Configuration>,
  ) {}

  async pullChanges(lastSyncTimestamp?: string) {
    const whereCondition: FindOptionsWhere<any> = lastSyncTimestamp
      ? { updated_at: MoreThan(new Date(lastSyncTimestamp)) }
      : {};

    const contributionsQuery = this.contributionsRepo
      .createQueryBuilder('contribution')
      .leftJoinAndSelect('contribution.links', 'link')
      .leftJoinAndSelect('link.affiliate', 'affiliate')
      .orderBy('contribution.updated_at', 'DESC');
    
    if (lastSyncTimestamp) {
        contributionsQuery.where('contribution.updated_at > :lastSync', { lastSync: new Date(lastSyncTimestamp) });
    }
    const [affiliates, users, fines, contributions, attendance, configuration] = await Promise.all([
      this.affiliatesRepo.find({ where: whereCondition }),
      this.usersRepo.find({ where: whereCondition }),
      this.finesRepo.find({ where: whereCondition, relations: ['affiliate'] }),
      contributionsQuery.getMany(), 
      this.attendanceRepo.find({ where: whereCondition, relations: ['records'] }),
      this.configurationRepo.find({ where: whereCondition }),
    ]);

    return { affiliates, users, fines, contributions, attendance, configuration }; 
  }
}