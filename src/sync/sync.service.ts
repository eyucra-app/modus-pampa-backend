// sync.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';
import { AttendanceListEntity } from 'src/attendance/entities/attendance-list.entity';
import { ContributionEntity } from 'src/contributions/entities/contribution.entity';
import { FineEntity } from 'src/fines/entities/fine.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Configuration } from 'src/configuration/entities/configuration.entity';
import { Repository, MoreThan, FindOptionsWhere, IsNull, Not } from 'typeorm';

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

  /**
   * Obtiene los cambios (actualizaciones y eliminaciones) desde la última sincronización.
   * @param lastSyncTimestamp - Fecha de la última sincronización en formato ISO string.
   */
  async pullChanges(lastSyncTimestamp?: string) {
    
    const baseConditions = (repo: Repository<any>) => {
        const updatedWhere: FindOptionsWhere<any> = {
            // Solo trae registros no eliminados
            deleted_at: IsNull(), 
        };
        const deletedWhere: FindOptionsWhere<any> = {
            // Solo trae registros eliminados
            deleted_at: Not(IsNull()),
        };

        if (lastSyncTimestamp) {
            const lastSyncDate = new Date(lastSyncTimestamp);
            updatedWhere.updated_at = MoreThan(lastSyncDate);
            deletedWhere.deleted_at = MoreThan(lastSyncDate);
        }

        return {
            updated: repo.find({ where: updatedWhere, withDeleted: false }),
            deleted: repo.find({ where: deletedWhere, select: ['uuid'], withDeleted: true }).then(items => items.map(i => i.uuid)),
        };
    };

    const contributionsQueryBuilder = (deleted = false) => {
        const query = this.contributionsRepo.createQueryBuilder('contribution');
        
        if(deleted) {
            query.withDeleted().where('contribution.deleted_at IS NOT NULL');
            if (lastSyncTimestamp) {
                query.andWhere('contribution.deleted_at > :lastSync', { lastSync: new Date(lastSyncTimestamp) });
            }
            return query.select(['contribution.uuid']).getMany().then(items => items.map(i => i.uuid));
        }

        query.leftJoinAndSelect('contribution.links', 'link');
        query.where('contribution.deleted_at IS NULL');
        if (lastSyncTimestamp) {
            query.andWhere('contribution.updated_at > :lastSync', { lastSync: new Date(lastSyncTimestamp) });
        }
        return query.getMany();
    };

    const attendanceQueryBuilder = (deleted = false) => {
        const query = this.attendanceRepo.createQueryBuilder('attendance');
        if(deleted) {
            query.withDeleted().where('attendance.deleted_at IS NOT NULL');
            if (lastSyncTimestamp) {
                query.andWhere('attendance.deleted_at > :lastSync', { lastSync: new Date(lastSyncTimestamp) });
            }
            return query.select(['attendance.uuid']).getMany().then(items => items.map(i => i.uuid));
        }
        
        query.leftJoinAndSelect('attendance.records', 'record').where('attendance.deleted_at IS NULL');
        if (lastSyncTimestamp) {
             query.andWhere('attendance.updated_at > :lastSync', { lastSync: new Date(lastSyncTimestamp) });
        }
        return query.getMany();
    }


    const [affiliates, users, fines, contributions, attendance, configuration] = await Promise.all([
        baseConditions(this.affiliatesRepo),
        baseConditions(this.usersRepo),
        baseConditions(this.finesRepo),
        { updated: contributionsQueryBuilder(), deleted: contributionsQueryBuilder(true) },
        { updated: attendanceQueryBuilder(), deleted: attendanceQueryBuilder(true) },
        // La configuración usualmente no se elimina, solo se actualiza.
        this.configurationRepo.find({ where: lastSyncTimestamp ? { updated_at: MoreThan(new Date(lastSyncTimestamp)) } : {} }),
    ]);

    return { affiliates, users, fines, contributions, attendance, configuration };
  }
}