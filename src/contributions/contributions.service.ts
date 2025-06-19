import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ContributionEntity } from './entities/contribution.entity';
import { ContributionAffiliateLinkEntity } from './entities/contribution-affiliate-link.entity';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionEntity)
    private readonly contributionsRepository: Repository<ContributionEntity>,
    private readonly entityManager: EntityManager, // Inyectamos EntityManager para transacciones
  ) {}

  /**
   * Crea o actualiza una contribución y sus enlaces a afiliados en una transacción.
   */
  async upsert(createDto: CreateContributionDto, id?: number): Promise<ContributionEntity> {
    return this.entityManager.transaction(async transactionalEntityManager => {
      // 1. Crear y guardar la entidad principal 'Contribution'
      const { links, ...mainData } = createDto;
      
      const contributionData = {
          ...mainData,
          date: new Date(mainData.date),
      };
      
      if (id) {
        await transactionalEntityManager.update(ContributionEntity, id, contributionData);
      }
      
      const contribution = id 
        ? await transactionalEntityManager.findOneByOrFail(ContributionEntity, { id })
        : await transactionalEntityManager.save(ContributionEntity, contributionData);

      // 2. Borrar los enlaces antiguos si estamos actualizando
      if (id) {
        await transactionalEntityManager.delete(ContributionAffiliateLinkEntity, { contributionId: id });
      }

      // 3. Crear y guardar las nuevas entidades de enlace
      if (links && links.length > 0) {
        const linkEntities = links.map(linkDto => {
          return transactionalEntityManager.create(ContributionAffiliateLinkEntity, {
            ...linkDto,
            contributionId: contribution.id,
          });
        });
        await transactionalEntityManager.save(linkEntities);
      }
      
      // 4. Devolver la entidad completa con sus relaciones (LÍNEA CORREGIDA)
      return transactionalEntityManager.findOne(ContributionEntity, { // <--- CORRECCIÓN AQUÍ
          where: { id: contribution.id },
          relations: ['links', 'links.affiliate']
      });
    });
  }

  findAll(): Promise<ContributionEntity[]> {
    return this.contributionsRepository.find({ relations: ['links'] });
  }

  async findOne(id: number): Promise<ContributionEntity> {
    const contribution = await this.contributionsRepository.findOne({
      where: { id },
      relations: ['links', 'links.affiliate'],
    });
    if (!contribution) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada.`);
    }
    return contribution;
  }

  async remove(id: number): Promise<void> {
    // Gracias a `onDelete: 'CASCADE'` en la entidad,
    // al borrar una contribución, se borrarán sus enlaces asociados.
    const result = await this.contributionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada.`);
    }
  }
}