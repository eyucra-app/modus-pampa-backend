import { IsUUID, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class AttendanceRecordDto {
  @IsUUID()
  @IsNotEmpty()
  affiliateUuid: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  @IsNotEmpty()
  registeredAt: string;
}