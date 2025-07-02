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

  async pullChanges(lastSyncTimestamp?: string) {
    
    const getWhereConditions = (timestamp?: string) => {
      const lastSyncDate = timestamp ? new Date(timestamp) : undefined;
      
      const updatedWhere: FindOptionsWhere<any> = { deleted_at: IsNull() };
      if (lastSyncDate) {
        updatedWhere.updated_at = MoreThan(lastSyncDate);
      }

      const deletedWhere: FindOptionsWhere<any> = { deleted_at: Not(IsNull()) };
      if (lastSyncDate) {
        deletedWhere.deleted_at = MoreThan(lastSyncDate);
      }

      return { updatedWhere, deletedWhere };
    };

    const { updatedWhere, deletedWhere } = getWhereConditions(lastSyncTimestamp);

    const fetchEntityData = (repo: Repository<any>, where: FindOptionsWhere<any>, options: { relations?: any } = {}) => {
        return repo.find({ where, ...options });
    };

    const fetchDeletedUuids = (repo: Repository<any>, where: FindOptionsWhere<any>) => {
        return repo.find({ where, select: ['uuid'], withDeleted: true }).then(items => items.map(i => i.uuid));
    };

    // --- MODIFICACIÓN CLAVE ---
    // Se crea una condición de búsqueda específica para Configuration que NO incluye 'deleted_at'.
    const configWhere: FindOptionsWhere<Configuration> = {};
    if (lastSyncTimestamp) {
        configWhere.updated_at = MoreThan(new Date(lastSyncTimestamp));
    }

    const [
      affiliatesUpdated, affiliatesDeleted,
      usersUpdated, usersDeleted,
      finesUpdated, finesDeleted,
      contributionsUpdated, contributionsDeleted,
      attendanceUpdated, attendanceDeleted,
      configuration
    ] = await Promise.all([
      fetchEntityData(this.affiliatesRepo, updatedWhere),
      fetchDeletedUuids(this.affiliatesRepo, deletedWhere),
      fetchEntityData(this.usersRepo, updatedWhere),
      fetchDeletedUuids(this.usersRepo, deletedWhere),
      fetchEntityData(this.finesRepo, updatedWhere, { relations: ['affiliate'] }),
      fetchDeletedUuids(this.finesRepo, deletedWhere),
      fetchEntityData(this.contributionsRepo, updatedWhere, { relations: ['links'] }),
      fetchDeletedUuids(this.contributionsRepo, deletedWhere),
      fetchEntityData(this.attendanceRepo, updatedWhere, { relations: ['records'] }),
      fetchDeletedUuids(this.attendanceRepo, deletedWhere),
      // Se utiliza la nueva condición 'configWhere' para la consulta de configuración.
      this.configurationRepo.find({ where: configWhere }),
    ]);

    return {
      affiliates: { updated: affiliatesUpdated || [], deleted: affiliatesDeleted || [] },
      users: { updated: usersUpdated || [], deleted: usersDeleted || [] },
      fines: { updated: finesUpdated || [], deleted: finesDeleted || [] },
      contributions: { updated: contributionsUpdated || [], deleted: contributionsDeleted || [] },
      attendance: { updated: attendanceUpdated || [], deleted: attendanceDeleted || [] },
      configuration: configuration || [],
    };
  }
}