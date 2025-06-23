import { IsUUID, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class AttendanceRecordDto {
  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  @IsNotEmpty()
  registered_at: string;
}