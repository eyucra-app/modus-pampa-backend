import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration } from './entities/configuration.entity';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
  ) {}

  async update(updateDto: UpdateConfigurationDto): Promise<Configuration> {
    // La configuración siempre tiene id = 1
    const config = await this.configurationRepository.preload({
      id: 1,
      ...updateDto,
    });

    if (!config) {
        // si no existe, se crea una nueva
        const newConfig = this.configurationRepository.create({id: 1, ...updateDto});
        return this.configurationRepository.save(newConfig);
    }
    
    return this.configurationRepository.save(config);
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