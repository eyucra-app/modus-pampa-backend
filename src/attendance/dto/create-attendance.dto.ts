import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceRecordDto } from './attendance-record.dto';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  createdAt: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  // Array de registros de asistencia anidados
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}