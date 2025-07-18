import { IsNumber, Min, IsOptional, IsString } from "class-validator";

export class CreateConfigurationDto {

     @IsNumber()
     @Min(0) // El monto pagado no puede ser negativo
     @IsOptional() // Es opcional, ya que al crear la multa suele ser 0
     monto_multa_retraso?: number;

     @IsNumber()
     @Min(0) // El monto pagado no puede ser negativo
     @IsOptional() // Es opcional, ya que al crear la multa suele ser 0
     monto_multa_falta?: number;

     @IsString()
     @IsOptional() // Es opcional, ya que al crear la multa suele ser 0
     backend_url?: string;
}
