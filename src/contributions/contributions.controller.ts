import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { PatchContributionLinkDto } from './dto/path-contribution-link.dto';

@Controller('contributions') // Ruta base: /api/contributions
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  create(@Body() createDto: CreateContributionDto) {
    return this.contributionsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.contributionsService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.contributionsService.findOne(uuid);
  }

  @Patch('link/:uuid') // Endpoint específico para actualizar un enlace
  patchLink(@Param('uuid') uuid: string, @Body() patchDto: PatchContributionLinkDto) {
    return this.contributionsService.patchLink(uuid, patchDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.contributionsService.remove(uuid);
  }
}