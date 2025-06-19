import { IsString, IsNotEmpty, IsUUID, IsNumber, IsDateString, IsPositive } from 'class-validator';

export class CreateFineDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsUUID()
  @IsNotEmpty()
  affiliateId: string; // El UUID del afiliado al que pertenece la multa
}