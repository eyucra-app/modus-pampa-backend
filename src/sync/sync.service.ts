import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';
import { AttendanceListEntity } from 'src/attendance/entities/attendance-list.entity';
import { ContributionEntity } from 'src/contributions/entities/contribution.entity';
import { FineEntity } from 'src/fines/entities/fine.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository, MoreThan, FindOptionsWhere } from 'typeorm';

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
    const whereCondition: FindOptionsWhere<any> = lastSyncTimestamp
      ? { updated_at: MoreThan(new Date(lastSyncTimestamp)) }
      : {};

    const contributionsQuery = this.contributionsRepo
      .createQueryBuilder('contribution') // 'contribution' es el alias para ContributionEntity
      .leftJoinAndSelect('contribution.links', 'link') // Carga la relación 'links' y le da el alias 'link'
      .leftJoinAndSelect('link.affiliate', 'affiliate') // Opcional: Carga el afiliado dentro de cada link
      .orderBy('contribution.updated_at', 'DESC');
    
    // Si hay un timestamp, se añade la condición 'where' a la consulta
    if (lastSyncTimestamp) {
        contributionsQuery.where('contribution.updated_at > :lastSync', { lastSync: new Date(lastSyncTimestamp) });
    }
    const [affiliates, users, fines, contributions, attendance] = await Promise.all([
      this.affiliatesRepo.find({ where: whereCondition }),
      this.usersRepo.find({ where: whereCondition }),
      this.finesRepo.find({ where: whereCondition, relations: ['affiliate'] }),
      
      // Se ejecuta la nueva consulta explícita en lugar del .find()
      contributionsQuery.getMany(), 

      this.attendanceRepo.find({ where: whereCondition, relations: ['records'] }),
    ]);

    return { affiliates, users, fines, contributions, attendance };
  }
}