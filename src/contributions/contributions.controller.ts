import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';

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