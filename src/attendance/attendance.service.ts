import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceListEntity } from './entities/attendance-list.entity';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceListEntity)
    private readonly listsRepository: Repository<AttendanceListEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async upsert(createDto: CreateAttendanceDto, id?: number): Promise<AttendanceListEntity> {
    return this.entityManager.transaction(async transactionalEntityManager => {
      // 1. Crear y guardar la entidad principal 'AttendanceList'
      const { records, ...mainData } = createDto;

      const listData = {
          ...mainData,
          created_at: new Date(mainData.createdAt),
      };

      if (id) {
        await transactionalEntityManager.update(AttendanceListEntity, id, listData);
      }

      const list = id
        ? await transactionalEntityManager.findOneByOrFail(AttendanceListEntity, { id })
        : await transactionalEntityManager.save(AttendanceListEntity, listData);
        
      // 2. Borrar registros antiguos si se actualiza
      if (id) {
          await transactionalEntityManager.delete(AttendanceRecordEntity, { listId: id });
      }

      // 3. Crear y guardar los nuevos registros
      if (records && records.length > 0) {
        const recordEntities = records.map(recordDto => {
          return transactionalEntityManager.create(AttendanceRecordEntity, {
            ...recordDto,
            listId: list.id,
            registeredAt: new Date(recordDto.registeredAt),
          });
        });
        await transactionalEntityManager.save(recordEntities);
      }
      
      // 4. Devolver la entidad completa (LÍNEA CORREGIDA)
      return transactionalEntityManager.findOne(AttendanceListEntity, { // <--- CORRECCIÓN AQUÍ
          where: { id: list.id },
          relations: ['records', 'records.affiliate']
      });
    });
  }

  findAll(): Promise<AttendanceListEntity[]> {
    return this.listsRepository.find({ relations: ['records'] });
  }

  async findOne(id: number): Promise<AttendanceListEntity> {
    const list = await this.listsRepository.findOne({
      where: { id },
      relations: ['records', 'records.affiliate'],
    });
    if (!list) {
      throw new NotFoundException(`Lista de asistencia con ID ${id} no encontrada.`);
    }
    return list;
  }

  async remove(id: number): Promise<void> {
    const result = await this.listsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lista de asistencia con ID ${id} no encontrada.`);
    }
  }
}