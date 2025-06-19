import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ContributionEntity } from './entities/contribution.entity';
import { ContributionAffiliateLinkEntity } from './entities/contribution-affiliate-link.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionEntity)
    private readonly contributionsRepository: Repository<ContributionEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async upsert(createDto: CreateContributionDto, id?: number): Promise<ContributionEntity> {
    return this.entityManager.transaction(async transactionalEntityManager => {
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

      if (id) {
        await transactionalEntityManager.delete(ContributionAffiliateLinkEntity, { contributionId: id });
      }

      if (links && links.length > 0) {
        const linkEntities = links.map(linkDto => {
          return transactionalEntityManager.create(ContributionAffiliateLinkEntity, {
            ...linkDto,
            contributionId: contribution.id,
          });
        });
        await transactionalEntityManager.save(linkEntities);
      }
      
      // Devolver la entidad completa con sus relaciones
      return transactionalEntityManager.findOne(ContributionEntity, {
          where: { id: contribution.id },
          // <<<--- CORRECCIÓN AQUÍ: 'details' cambiado a 'links'
          relations: ['links', 'links.affiliate'] 
      });
    });
  }

  // Los otros métodos (findAll, findOne, remove) también deben usar 'links'
  findAll(): Promise<ContributionEntity[]> {
    return this.contributionsRepository.find({ relations: ['links'] });
  }

  async findOne(id: number): Promise<ContributionEntity> {
    const contribution = await this.contributionsRepository.findOne({
      where: { id },
      relations: ['links', 'links.affiliate'], // <<<--- CORRECCIÓN AQUÍ
    });
    if (!contribution) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada.`);
    }
    return contribution;
  }

  async remove(id: number): Promise<void> {
    const result = await this.contributionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contribución con ID ${id} no encontrada.`);
    }
  }
}
