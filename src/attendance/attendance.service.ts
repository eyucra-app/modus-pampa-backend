// src/attendance/attendance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AttendanceListEntity } from './entities/attendance-list.entity';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceListEntity)
    private readonly listsRepository: Repository<AttendanceListEntity>,
    @InjectRepository(AttendanceRecordEntity)
    private readonly recordsRepository: Repository<AttendanceRecordEntity>,
    private readonly eventsGateway: EventsGateway, 
  ) {}

  async upsertListWithRecords(dto: CreateAttendanceDto): Promise<AttendanceListEntity> {
    const { records, ...listData } = dto;
    
    const savedList = await this.listsRepository.save({
      ...listData,
      created_at: new Date(listData.created_at),
      updated_at: new Date(listData.updated_at),
    });

    await this.recordsRepository.delete({ list_uuid: savedList.uuid });

    if (records && records.length > 0) {
      const recordEntities = records.map(recordDto => this.recordsRepository.create({
        ...recordDto,
        list_uuid: savedList.uuid,
        registered_at: new Date(recordDto.registered_at),
      }));
      await this.recordsRepository.save(recordEntities);
    }
    
    this.eventsGateway.emitChange('attendanceChanged', {
        message: `Lista de asistencia actualizada: ${savedList.uuid}`,
        uuid: savedList.uuid
    });

    return this.listsRepository.findOne({
      where: { uuid: savedList.uuid },
      relations: ['records'],
    });
  }

  findAll(): Promise<AttendanceListEntity[]> {
    return this.listsRepository.find({ relations: ['records'] });
  }

  async remove(uuid: string): Promise<void> {
    const list = await this.listsRepository.findOneBy({ uuid });
    if (!list) {
      throw new NotFoundException(`Lista de asistencia con UUID ${uuid} no encontrada.`);
    }

    // Borrado lógico de la lista. TypeORM no borrará en cascada con soft-delete,
    // pero nuestra DB si tiene ON DELETE CASCADE, esto podría funcionar.
    // Si no, necesitaríamos borrar los records primero.
    const records = await this.recordsRepository.findBy({ list_uuid: uuid });
    await this.recordsRepository.softRemove(records);
    await this.listsRepository.softRemove(list);

    this.eventsGateway.emitChange('attendanceChanged', {
        action: 'delete',
        message: `Lista de asistencia eliminada: ${uuid}`,
        uuid: uuid
    });
  }
}