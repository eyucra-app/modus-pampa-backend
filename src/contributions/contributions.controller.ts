import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe, Patch, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionLinkDto } from './dto/update-contribution-link.dto';

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