import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FineEntity } from './entities/fine.entity';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(FineEntity)
    private readonly finesRepository: Repository<FineEntity>,
  ) {}

  async upsert(fineData: CreateFineDto): Promise<FineEntity> {
    const fine = this.finesRepository.create({
        ...fineData,
        date: new Date(fineData.date) // Convertir string a objeto Date
    });
    return this.finesRepository.save(fine);
  }

  async update(uuid: string, updateData: UpdateFineDto): Promise<FineEntity> {
    // Usamos preload para buscar la multa y fusionar los nuevos datos
    const fine = await this.finesRepository.preload({
      uuid: uuid,
      ...updateData,
      // Si la fecha se envía en la actualización, también la convertimos
      ...(updateData.date && { date: new Date(updateData.date) }),
    });

    if (!fine) {
      throw new NotFoundException(`Multa con UUID '${uuid}' no encontrada.`);
    }
    // Guardamos la entidad ya actualizada
    return this.finesRepository.save(fine);
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.finesRepository.delete(uuid);
    if (result.affected === 0) {
      throw new NotFoundException(`Multa con UUID '${uuid}' no encontrada.`);
    }
  }

  findAll(): Promise<FineEntity[]> {
    return this.finesRepository.find({ relations: ['affiliate'] });
  }

  // Método extra: Encontrar todas las multas de un afiliado
  findByAffiliate(affiliateId: string): Promise<FineEntity[]> {
      return this.finesRepository.findBy({ affiliate_uuid: affiliateId });
  }
}