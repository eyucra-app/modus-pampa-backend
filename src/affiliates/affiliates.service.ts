import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAffiliateDto } from './dto/create-affiliate.dto';
import { AffiliateEntity } from './entities/affiliate.entity';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(AffiliateEntity)
    private readonly affiliatesRepository: Repository<AffiliateEntity>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Crea un nuevo afiliado o actualiza uno existente si el UUID ya existe.
   * El método `save` de TypeORM maneja esta lógica de "upsert" automáticamente
   * cuando se trabaja con una entidad que tiene una clave primaria.
   * @param affiliateData - Los datos del afiliado a crear o actualizar.
   * @returns La entidad del afiliado guardada.
   */
  async upsert(affiliateData: CreateAffiliateDto): Promise<AffiliateEntity> {
    // El DTO se mapea directamente a la entidad gracias a que comparten la misma estructura.
    // TypeORM se encarga de crear un nuevo registro si el 'uuid' no existe,
    // o de actualizar el existente si sí lo encuentra.

    const affiliateToSave = this.affiliatesRepository.create(affiliateData);
    // Guardamos la entidad en la base de datos
    const savedAffiliate = await this.affiliatesRepository.save(affiliateToSave);

    // 3. Emitimos el evento DESPUÉS de guardar y con los datos correctos
    this.eventsGateway.emitChange('affiliatesChanged', {
      message: 'La lista de afiliados ha cambiado.',
      uuid: savedAffiliate.uuid,
    });

    // Devolvemos la entidad guardada
    return savedAffiliate;
  }

  /**
   * Elimina un afiliado de la base de datos usando su UUID.
   * @param uuid - El UUID del afiliado a eliminar.
   * @returns void
   */
  async remove(uuid: string): Promise<void> {
    const affiliate = await this.affiliatesRepository.findOneBy({ uuid });
    if (!affiliate) {
      throw new NotFoundException(`Afiliado con UUID '${uuid}' no encontrado.`);
    }
    
    // Usar softRemove para el borrado lógico
    await this.affiliatesRepository.softRemove(affiliate);

    // Enviar un evento claro de eliminación
    this.eventsGateway.emitChange('affiliatesChanged', {
        action: 'delete',
        message: `Afiliado ${uuid} eliminado.`,
        uuid: uuid
    });
  }
  /**
   * Encuentra todos los afiliados en la base de datos.
   * @returns Un array con todas las entidades de afiliados.
   */
  findAll(): Promise<AffiliateEntity[]> {
    return this.affiliatesRepository.find();
  }

  /**
   * Encuentra un afiliado específico por su UUID.
   * @param uuid - El UUID del afiliado a buscar.
   * @returns La entidad del afiliado si se encuentra.
   */
  async findOne(uuid: string): Promise<AffiliateEntity> {
    const affiliate = await this.affiliatesRepository.findOneBy({ uuid });
    if (!affiliate) {
      throw new NotFoundException(`Afiliado con UUID '${uuid}' no encontrado.`);
    }
    return affiliate;
  }
}