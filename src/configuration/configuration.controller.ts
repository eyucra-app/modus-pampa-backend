import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Controller('api/configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}


  @Get()
  findOne() {
    return this.configurationService.findOne();
  }

  @Patch()
  update(@Body() updateConfigurationDto: UpdateConfigurationDto) {
    return this.configurationService.update(updateConfigurationDto);
  }

}