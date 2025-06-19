import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe, Patch } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.upsert(createAttendanceDto);
  }

  @Patch(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() createAttendanceDto: CreateAttendanceDto,
  ) {
      return this.attendanceService.upsert(createAttendanceDto, id);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}