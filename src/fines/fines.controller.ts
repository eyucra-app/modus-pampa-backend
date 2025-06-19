import { Controller, Post, Body, Param, Delete, Patch, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { FinesService } from './fines.service';
import { CreateFineDto } from './dto/create-fine.dto';

@Controller('api/fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() createFineDto: CreateFineDto) {
    return this.finesService.upsert(createFineDto);
  }

  @Patch(':uuid')
  update(@Body() createFineDto: CreateFineDto) {
    return this.finesService.upsert(createFineDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.finesService.remove(uuid);
  }

  @Get()
  findAll() {
    return this.finesService.findAll();
  }

  @Get('by-affiliate/:affiliateId')
  findByAffiliate(@Param('affiliateId') affiliateId: string) {
      return this.finesService.findByAffiliate(affiliateId);
  }
}