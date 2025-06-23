import { Controller, Post, Body, Param, Delete, Patch, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { FinesService } from './fines.service';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

@Controller('api/fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() createFineDto: CreateFineDto) {
    return this.finesService.upsert(createFineDto);
  }

  @Put(':uuid') 
  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateFineDto: UpdateFineDto) {
    return this.finesService.update(uuid, updateFineDto);
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