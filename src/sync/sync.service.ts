// sync.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';
import { AttendanceListEntity } from 'src/attendance/entities/attendance-list.entity';
import { ContributionEntity } from 'src/contributions/entities/contribution.entity';
import { FineEntity } from 'src/fines/entities/fine.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Configuration } from 'src/configuration/entities/configuration.entity';
import { Repository, MoreThan, FindOptionsWhere, IsNull, Not, DataSource } from 'typeorm';
import { ContributionAffiliateLinkEntity } from 'src/contributions/entities/contribution-affiliate-link.entity';

@Injectable()
export class SyncService {
  constructor(
    private dataSource: DataSource, // Inyectamos el DataSource para transacciones
    @InjectRepository(AffiliateEntity) private affiliatesRepo: Repository<AffiliateEntity>,
    @InjectRepository(UserEntity) private usersRepo: Repository<UserEntity>,
    @InjectRepository(FineEntity) private finesRepo: Repository<FineEntity>,
    @InjectRepository(ContributionEntity) private contributionsRepo: Repository<ContributionEntity>,
    @InjectRepository(AttendanceListEntity) private attendanceRepo: Repository<AttendanceListEntity>,
    @InjectRepository(Configuration) private configurationRepo: Repository<Configuration>,
    @InjectRepository(ContributionAffiliateLinkEntity) private linksRepo: Repository<ContributionAffiliateLinkEntity>,
  ) {}

  /**
   * Obtiene los cambios (actualizaciones y eliminaciones) desde la última sincronización.
   * @param lastSyncTimestamp - Fecha de la última sincronización en formato ISO string.
   */
  async pullChanges(lastSyncTimestamp?: string) {
    
    // Función auxiliar para construir las condiciones de búsqueda
    const getWhereConditions = (timestamp?: string) => {
      const lastSyncDate = timestamp ? new Date(timestamp) : undefined;
      
      const updatedWhere: FindOptionsWhere<any> = {
        deleted_at: IsNull(),
        ...(lastSyncDate && { updated_at: MoreThan(lastSyncDate) }),
      };

      const deletedWhere: FindOptionsWhere<any> = {
        deleted_at: Not(IsNull()),
        ...(lastSyncDate && { deleted_at: MoreThan(lastSyncDate) }),
      };

      return { updatedWhere, deletedWhere };
    };

    const { updatedWhere, deletedWhere } = getWhereConditions(lastSyncTimestamp);

    // Función para obtener los datos de una entidad
    const fetchEntityData = async (repo: Repository<any>, where: FindOptionsWhere<any>, options: { select?: any, relations?: any, withDeleted?: boolean } = {}) => {
        return repo.find({ where, ...options });
    };

    // Obtenemos los UUIDs de los eliminados
    const fetchDeletedUuids = async (repo: Repository<any>, where: FindOptionsWhere<any>) => {
        const items = await repo.find({ where, select: ['uuid'], withDeleted: true });
        return items.map(i => i.uuid);
    };

    // Consultas específicas con Joins
    const fetchContributionsUpdated = async (where: FindOptionsWhere<ContributionEntity>) => {
        return this.contributionsRepo.find({ where, relations: ['links'] });
    }

    const fetchAttendanceUpdated = async (where: FindOptionsWhere<AttendanceListEntity>) => {
        return this.attendanceRepo.find({ where, relations: ['records'] });
    }
    
    // Ejecutamos todas las promesas en paralelo
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
      fetchContributionsUpdated(updatedWhere),
      fetchDeletedUuids(this.contributionsRepo, deletedWhere),
      fetchAttendanceUpdated(updatedWhere),
      fetchDeletedUuids(this.attendanceRepo, deletedWhere),
      this.configurationRepo.find({ where: updatedWhere }),
    ]);

    // Construimos la respuesta final, asegurando que siempre sean arrays
    return {
      affiliates: {
        updated: affiliatesUpdated || [],
        deleted: affiliatesDeleted || [],
      },
      users: {
        updated: usersUpdated || [],
        deleted: usersDeleted || [],
      },
      fines: {
        updated: finesUpdated || [],
        deleted: finesDeleted || [],
      },
      contributions: {
        updated: contributionsUpdated || [],
        deleted: contributionsDeleted || [],
      },
      attendance: {
        updated: attendanceUpdated || [],
        deleted: attendanceDeleted || [],
      },
      configuration: configuration || [],
    };
  }
}