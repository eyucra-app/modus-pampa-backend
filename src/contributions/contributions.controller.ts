import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe, Patch, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionLinkDto } from './dto/update-contribution-link.dto';
import { PatchContributionLinkDto } from './dto/path-contribution-link.dto';

@Controller('api/contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() createContributionDto: CreateContributionDto) {
    return this.contributionsService.upsert(createContributionDto);
  }
  
  // Este endpoint ahora usa UUID
  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() createContributionDto: CreateContributionDto
  ) {
    // La lógica de upsert ya maneja la creación/actualización por UUID
    return this.contributionsService.upsert(createContributionDto);
  }

  @Put('link')
  @HttpCode(HttpStatus.OK)
  updateContributionLink(@Body() updateLinkDto: UpdateContributionLinkDto) {
    return this.contributionsService.updateLink(updateLinkDto);
  }

  @Patch('link/:uuid') // Usar PATCH para actualizaciones parciales y recibir el UUID por la URL
  update_Link(
    @Param('uuid') uuid: string,
    @Body() updateLinkDto: UpdateContributionLinkDto
  ) {
    // La lógica del servicio que implementamos antes ya no necesita que le pases el UUID
    // dos veces. Se lo pasamos como un parámetro separado.
    return this.contributionsService.update_Link(uuid, updateLinkDto);
  }

  @Patch('link/:uuid') // Nuevo endpoint: PATCH /api/contributions/link/:uuid
  patchLink(
    @Param('uuid') uuid: string,
    @Body() patchDto: PatchContributionLinkDto,
  ) {
    return this.contributionsService.patchLink(uuid, patchDto);
  } 

  @Get()
  findAll() {
    return this.contributionsService.findAll();
  }

  // Este endpoint ahora usa UUID
  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.contributionsService.findOne(uuid);
  }

  // Este endpoint ahora usa UUID
  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.contributionsService.remove(uuid);
  }
}