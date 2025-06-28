// src/attendance/attendance.controller.ts
import { Controller, Post, Body, Get, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // Recibe una lista de asistencia completa para guardarla (crear o actualizar)
  @Post()
  upsert(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.upsertListWithRecords(createAttendanceDto);
  }

  // Obtiene todas las listas (para la sincronización PULL)
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  // Elimina una lista y sus registros asociados
  @Delete(':uuid')
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.attendanceService.remove(uuid);
  }
}