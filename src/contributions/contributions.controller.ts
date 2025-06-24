import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe, Patch, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionLinkDto } from './dto/update-contribution-link.dto';

@Controller('api/contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  create(@Body() createContributionDto: CreateContributionDto) {
    return this.contributionsService.upsert(createContributionDto);
  }
  
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() createContributionDto: CreateContributionDto
  ) {
    return this.contributionsService.upsert(createContributionDto, id);
  }

  @Put('link') // Responderá a PUT /api/contributions/link
  @HttpCode(HttpStatus.OK)
  updateContributionLink(@Body() updateLinkDto: UpdateContributionLinkDto) {
    return this.contributionsService.updateLink(updateLinkDto);
  }

  @Get()
  findAll() {
    return this.contributionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contributionsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contributionsService.remove(id);
  }
}