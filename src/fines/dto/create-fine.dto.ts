import { IsString, IsNotEmpty, IsUUID, IsNumber, IsDateString, IsPositive, IsBoolean, IsOptional, Min } from 'class-validator';

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

  @IsNumber()
  @Min(0) // El monto pagado no puede ser negativo
  @IsOptional() // Es opcional, ya que al crear la multa suele ser 0
  amount_paid?: number;

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
  
  @IsUUID()
  @IsOptional() // Hacemos que el campo sea opcional en las peticiones
  related_attendance_uuid?: string;
}