import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributionEntity } from './entities/contribution.entity';
import { ContributionAffiliateLinkEntity } from './entities/contribution-affiliate-link.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { PatchContributionLinkDto } from './dto/path-contribution-link.dto';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(ContributionEntity)
    private readonly contributionsRepository: Repository<ContributionEntity>,
    @InjectRepository(ContributionAffiliateLinkEntity)
    private readonly linksRepository: Repository<ContributionAffiliateLinkEntity>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // Crea una contribución y sus enlaces iniciales
  async create(dto: CreateContributionDto): Promise<ContributionEntity> {
    const { links, ...mainData } = dto;

    const contribution = this.contributionsRepository.create({
      ...mainData,
      date: new Date(mainData.date),
    });
    const savedContribution = await this.contributionsRepository.save(contribution);

    const linkEntities = links.map(linkDto => this.linksRepository.create({
      ...linkDto,
      contribution_uuid: savedContribution.uuid,
    }));
    await this.linksRepository.save(linkEntities);

    this.eventsGateway.emitChange('contributionsChanged', {
      message: `Contribución creada: ${savedContribution.uuid}`,
      uuid: savedContribution.uuid
    });

    for (const link of linkEntities) {
      this.eventsGateway.emitChange('affiliatesChanged', {
        message: `Afiliado afectado por nueva contribución ${savedContribution.uuid}`,
        uuid: link.affiliate_uuid,
      });
    }

    return this.findOne(savedContribution.uuid);
  }

  // Obtiene todas las contribuciones con sus enlaces
  findAll(): Promise<ContributionEntity[]> {
    return this.contributionsRepository.find({
      relations: ['links', 'links.affiliate'], // Carga los enlaces y el afiliado de cada enlace
    });
  }

  // Obtiene una contribución específica
  async findOne(uuid: string): Promise<ContributionEntity> {
    const contribution = await this.contributionsRepository.findOne({
      where: { uuid },
      relations: ['links', 'links.affiliate'],
    });
    if (!contribution) {
      throw new NotFoundException(`Contribución con UUID ${uuid} no encontrada.`);
    }
    return contribution;
  }

  // Actualiza parcialmente un enlace (para pagos o edición de monto)
  async patchLink(uuid: string, dto: PatchContributionLinkDto): Promise<ContributionAffiliateLinkEntity> {
    const link = await this.linksRepository.findOneBy({ uuid });
    if (!link) {
      throw new NotFoundException(`Enlace de contribución con UUID ${uuid} no encontrado.`);
    }

    const updatedLink = this.linksRepository.merge(link, dto);
    const savedLink = await this.linksRepository.save(updatedLink);

    this.eventsGateway.emitChange('contributionsChanged', {
      message: `Enlace de contribución actualizado: ${savedLink.uuid}`,
      uuid: savedLink.contribution_uuid // Notificamos sobre la contribución padre
    });

    this.eventsGateway.emitChange('affiliatesChanged', {
      message: `Afiliado afectado por pago de contribución ${savedLink.contribution_uuid}`,
      uuid: savedLink.affiliate_uuid,
    });
    
    return savedLink;
  }

  // Elimina una contribución
  async remove(uuid: string): Promise<void> {
    const contribution = await this.contributionsRepository.findOneBy({ uuid });
    if (!contribution) {
        throw new NotFoundException(`Contribución con UUID ${uuid} no encontrada.`);
    }
    
    // El borrado en cascada (onDelete: 'CASCADE') no funciona con soft-delete.
    // Debemos borrar los enlaces manualmente.
    const links = await this.linksRepository.findBy({ contribution_uuid: uuid });
    await this.linksRepository.softRemove(links);
    await this.contributionsRepository.softRemove(contribution);

    this.eventsGateway.emitChange('contributionsChanged', {
      action: 'delete',
      message: `Contribución eliminada: ${uuid}`,
      uuid: uuid
    });

    this.eventsGateway.emitChange('contributionsChanged', {
      action: 'delete',
      message: `Contribución eliminada: ${uuid}`,
      uuid: uuid
    });
  }
}