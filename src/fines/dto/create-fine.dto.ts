import { IsString, IsNotEmpty, IsUUID, IsNumber, IsDateString, IsPositive, IsBoolean, IsOptional } from 'class-validator';

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

  @IsBoolean() 
  @IsOptional()
  is_paid?: boolean;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string; // El UUID del afiliado al que pertenece la multa
}