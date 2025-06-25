import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ContributionEntity } from './entities/contribution.entity';
import { ContributionAffiliateLinkEntity } from './entities/contribution-affiliate-link.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionLinkDto } from './dto/update-contribution-link.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionEntity)
    private readonly contributionsRepository: Repository<ContributionEntity>,
    @InjectRepository(ContributionAffiliateLinkEntity)
    private readonly linksRepository: Repository<ContributionAffiliateLinkEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async upsert(createDto: CreateContributionDto): Promise<ContributionEntity> {
    const { links, ...mainData } = createDto;

    // Buscamos si ya existe una contribución con ese UUID
    let contribution = await this.contributionsRepository.findOneBy({ uuid: mainData.uuid });

    // Si existe, la actualizamos. Si no, creamos una nueva.
    if (contribution) {
      contribution = this.contributionsRepository.merge(contribution, {
        ...mainData,
        date: new Date(mainData.date),
      });
    } else {
      contribution = this.contributionsRepository.create({
        ...mainData,
        date: new Date(mainData.date),
      });
    }

    // Guardamos la entidad padre
    const savedContribution = await this.contributionsRepository.save(contribution);

    // Borramos los enlaces antiguos para este aporte para asegurar consistencia
    await this.linksRepository.delete({ contribution_uuid: savedContribution.uuid });

    // Creamos y guardamos los nuevos enlaces
    if (links && links.length > 0) {
      const linkEntities = links.map(linkDto => {
        return this.linksRepository.create({
          ...linkDto,
          contribution_uuid: savedContribution.uuid, // Usamos el UUID del padre
        });
      });
      await this.linksRepository.save(linkEntities);
    }

    // Devolvemos la entidad completa con sus relaciones cargadas
    return this.findOne(savedContribution.uuid);
  }

  async updateLink(updateLinkDto: UpdateContributionLinkDto): Promise<ContributionAffiliateLinkEntity> {
    const { contribution_uuid, affiliate_uuid, ...updateData } = updateLinkDto;
    
    // El método `preload` busca la entidad por su clave y fusiona los nuevos datos
    const link = await this.linksRepository.preload({
      contribution_uuid,
      affiliate_uuid,
      ...updateData,
    });

    if (!link) {
      throw new NotFoundException(`Enlace de aporte no encontrado para el afiliado ${affiliate_uuid}`);
    }

    return this.linksRepository.save(link);
  }

  findAll(): Promise<ContributionEntity[]> {
    return this.contributionsRepository.find({ relations: ['links'] });
  }

  async findOne(uuid: string): Promise<ContributionEntity> {
    const contribution = await this.contributionsRepository.findOne({
      where: { uuid },
      relations: ['links', 'links.affiliate'],
    });
    if (!contribution) {
      throw new NotFoundException(`Aporte con UUID ${uuid} no encontrado.`);
    }
    return contribution;
  }

  async remove(uuid: string): Promise<void> {
    const result = await this.contributionsRepository.delete({ uuid });
    if (result.affected === 0) {
      throw new NotFoundException(`Aporte con UUID ${uuid} no encontrado.`);
    }
  }
}