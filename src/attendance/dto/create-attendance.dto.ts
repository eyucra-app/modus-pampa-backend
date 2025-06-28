// src/attendance/dto/create-attendance.dto.ts
import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para un registro individual
class RecordDto {
  @IsUUID()
  uuid: string;

  @IsUUID()
  affiliate_uuid: string;

  @IsString()
  status: string;

  @IsDateString()
  registered_at: string;
}

// DTO para el paquete completo de la lista
export class CreateAttendanceDto {
  @IsUUID()
  uuid: string;

  @IsString()
  name: string;

  @IsString()
  status: string;
  
  @IsDateString()
  created_at: string;
  
  @IsDateString()
  updated_at: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordDto)
  records: RecordDto[];
}