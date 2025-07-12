import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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
    // Extraemos el uuid para diferenciar entre creación y actualización
    const { uuid, id, ci } = affiliateData;

    // 1. Verificación de ID único en registros activos
    const existingById = await this.affiliatesRepository.findOne({
      where: {
        id: id,
        deleted_at: IsNull(),
      },
    });

    if (existingById && existingById.uuid !== uuid) {
      throw new ConflictException(`El ID de afiliado '${id}' ya está en uso por otro registro activo.`);
    }

    // 2. Verificación de CI único en registros activos
    const existingByCi = await this.affiliatesRepository.findOne({
      where: {
        ci: ci,
        deleted_at: IsNull(),
      },
    });

    if (existingByCi && existingByCi.uuid !== uuid) {
      throw new ConflictException(`El CI '${ci}' ya está en uso por otro registro activo.`);
    }

    const affiliateToSave = this.affiliatesRepository.create(affiliateData);
    const savedAffiliate = await this.affiliatesRepository.save(affiliateToSave);

    this.eventsGateway.emitChange('affiliatesChanged', {
      message: 'La lista de afiliados ha cambiado.',
      uuids: [savedAffiliate.uuid],
    });

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
        uuids: [uuid]
    });
  }
  /**
   * Encuentra todos los afiliados en la base de datos.
   * @returns Un array con todas las entidades de afiliados.
   */
  findAll(): Promise<AffiliateEntity[]> {
    // Asegurarse de traer solo los registros no eliminados
    return this.affiliatesRepository.find({ where: { deleted_at: IsNull() } });
  }

  /**
   * Encuentra un afiliado específico por su UUID.
   * @param uuid - El UUID del afiliado a buscar.
   * @returns La entidad del afiliado si se encuentra.
   */
  async findOne(uuid: string): Promise<AffiliateEntity> {
    const affiliate = await this.affiliatesRepository.findOne({ 
        where: { uuid, deleted_at: IsNull() } 
    });
    if (!affiliate) {
      throw new NotFoundException(`Afiliado con UUID '${uuid}' no encontrado.`);
    }
    return affiliate;
  }
}