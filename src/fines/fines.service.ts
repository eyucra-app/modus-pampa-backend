import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FineEntity } from './entities/fine.entity';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(FineEntity)
    private readonly finesRepository: Repository<FineEntity>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async upsert(fineData: CreateFineDto): Promise<FineEntity> {
    const fine = this.finesRepository.create({
        ...fineData,
        date: new Date(fineData.date)
    });
    const savedFine = await this.finesRepository.save(fine);

    this.eventsGateway.emitChange('finesChanged', {
      message: `Multa creada/actualizada: ${savedFine.uuid}`,
      uuid: savedFine.uuid
    });

    this.eventsGateway.emitChange('affiliatesChanged', {
      message: `Afiliado afectado por multa ${savedFine.uuid}`,
      uuid: savedFine.affiliate_uuid,
    });

    return savedFine;
  }

  async update(uuid: string, updateData: UpdateFineDto): Promise<FineEntity> {
    const fine = await this.finesRepository.preload({
      uuid: uuid,
      ...updateData,
      ...(updateData.date && { date: new Date(updateData.date) }),
    });

    if (!fine) {
      throw new NotFoundException(`Multa con UUID '${uuid}' no encontrada.`);
    }
    const updatedFine = await this.finesRepository.save(fine);

    this.eventsGateway.emitChange('finesChanged', {
      message: `Multa actualizada: ${updatedFine.uuid}`,
      uuid: updatedFine.uuid
    });

    this.eventsGateway.emitChange('affiliatesChanged', {
      message: `Afiliado afectado por multa ${updatedFine.uuid}`,
      uuid: updatedFine.affiliate_uuid,
    });

    return updatedFine;
  }

 async remove(uuid: string): Promise<void> {
    const fine = await this.finesRepository.findOneBy({ uuid });
    if (!fine) {
        throw new NotFoundException(`Multa con UUID '${uuid}' no encontrada.`);
    }

    await this.finesRepository.softRemove(fine);

    this.eventsGateway.emitChange('finesChanged', {
      action: 'delete',
      message: `Multa eliminada: ${uuid}`,
      uuid: uuid
    });

    this.eventsGateway.emitChange('affiliatesChanged', {
      message: `Afiliado afectado por eliminación de multa ${uuid}`,
      uuid: fine.affiliate_uuid,
    });
  }

  findAll(): Promise<FineEntity[]> {
    return this.finesRepository.find({ relations: ['affiliate'] });
  }

  // Método extra: Encontrar todas las multas de un afiliado
  findByAffiliate(affiliateId: string): Promise<FineEntity[]> {
      return this.finesRepository.findBy({ affiliate_uuid: affiliateId });
  }
}