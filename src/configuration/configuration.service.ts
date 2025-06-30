import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration } from './entities/configuration.entity';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
    private readonly eventsGateway: EventsGateway, 
  ) {}

  async update(updateDto: UpdateConfigurationDto): Promise<Configuration> {
    // La configuración siempre tiene id = 1
    const configToPreload = { id: 1, ...updateDto };
    let config = await this.configurationRepository.preload(configToPreload);

    if (!config) {
        config = this.configurationRepository.create(configToPreload);
    }
    
    const savedConfig = await this.configurationRepository.save(config);

    this.eventsGateway.emitChange('configurationChanged', {
      message: 'La configuración ha sido actualizada.',
    });

    return savedConfig;
  }

  async findOne(): Promise<Configuration> {
    const config = await this.configurationRepository.findOneBy({ id: 1 });
    if (!config) {
      // Si no hay configuración, se puede devolver una por defecto o lanzar un error
      // En este caso, creamos una configuración por defecto.
      const defaultConfig = this.configurationRepository.create({ id: 1 });
      return this.configurationRepository.save(defaultConfig);
    }
    return config;
  }
}