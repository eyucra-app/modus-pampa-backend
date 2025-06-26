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
  ) {}

  // --- MÉTODO UPSERT REESCRITO Y CORREGIDO ---
  async upsert(createDto: CreateContributionDto): Promise<ContributionEntity> {
    const { links, ...mainData } = createDto;

    // 1. Preparamos el aporte padre. Usamos la lógica de "upsert" de TypeORM.
    //    'preload' busca por la clave primaria (que es el uuid) y si encuentra
    //    el registro, fusiona los datos. Si no, devuelve undefined.
    let contribution = await this.contributionsRepository.preload({
      ...mainData,
      date: new Date(mainData.date),
    });

    // Si no se encontró (es nuevo), lo creamos.
    if (!contribution) {
      contribution = this.contributionsRepository.create({
        ...mainData,
        date: new Date(mainData.date),
      });
    }

    // Guardamos la entidad padre para asegurar que existe.
    const savedContribution = await this.contributionsRepository.save(contribution);

    // 2. Borramos los enlaces antiguos para este aporte para evitar duplicados y asegurar consistencia.
    await this.linksRepository.delete({ contribution_uuid: savedContribution.uuid });

    // 3. Creamos y guardamos los nuevos enlaces, asegurando que usen el UUID del padre.
    if (links && links.length > 0) {
      const linkEntities = links.map(linkDto => {
        return this.linksRepository.create({
          ...linkDto,
          contribution_uuid: savedContribution.uuid, // La relación se basa en el UUID
        });
      });
      await this.linksRepository.save(linkEntities);
    }

    // 4. Devolvemos la entidad completa con sus relaciones cargadas.
    return this.findOne(savedContribution.uuid);
  }

  async updateLink(updateLinkDto: UpdateContributionLinkDto): Promise<ContributionAffiliateLinkEntity> {
    // 1. Extraemos el UUID (la clave primaria) del DTO. El resto son los datos a actualizar.
    const { uuid, ...updateData } = updateLinkDto;

    // 2. Buscamos la entidad existente en la base de datos usando su clave primaria.
    const link = await this.linksRepository.findOneBy({ uuid });

    // 3. Si no se encuentra, lanzamos un error claro.
    if (!link) {
      throw new NotFoundException(`Enlace de aporte con UUID '${uuid}' no encontrado.`);
    }

    // 4. Fusionamos la entidad encontrada con los nuevos datos.
    // TypeORM se encarga de actualizar solo los campos que vienen en updateData.
    const updatedLink = this.linksRepository.merge(link, updateData);

    // 5. Guardamos la entidad actualizada.
    return this.linksRepository.save(updatedLink);
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