// src/attendance/attendance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceListEntity } from './entities/attendance-list.entity';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceListEntity)
    private readonly listsRepository: Repository<AttendanceListEntity>,
    @InjectRepository(AttendanceRecordEntity)
    private readonly recordsRepository: Repository<AttendanceRecordEntity>,
  ) {}

  async upsertListWithRecords(dto: CreateAttendanceDto): Promise<AttendanceListEntity> {
    const { records, ...listData } = dto;
    
    // 1. Guarda o actualiza la lista principal
    const savedList = await this.listsRepository.save({
      ...listData,
      created_at: new Date(listData.created_at),
      updated_at: new Date(listData.updated_at),
    });

    // 2. Borra los registros antiguos para esta lista para evitar duplicados
    await this.recordsRepository.delete({ list_uuid: savedList.uuid });

    // 3. Crea y guarda los nuevos registros
    if (records && records.length > 0) {
      const recordEntities = records.map(recordDto => this.recordsRepository.create({
        ...recordDto,
        list_uuid: savedList.uuid,
        registered_at: new Date(recordDto.registered_at),
      }));
      await this.recordsRepository.save(recordEntities);
    }
    
    return this.listsRepository.findOne({
      where: { uuid: savedList.uuid },
      relations: ['records'],
    });
  }

  findAll(): Promise<AttendanceListEntity[]> {
    return this.listsRepository.find({ relations: ['records'] });
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.listsRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Lista de asistencia con UUID ${uuid} no encontrada.`);
    }
  }
}