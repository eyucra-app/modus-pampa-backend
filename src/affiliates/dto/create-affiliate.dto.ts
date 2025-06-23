import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, IsNumber, IsUrl } from 'class-validator';

// Usaremos class-validator para asegurar que los datos que llegan son correctos.
// NestJS lo integra automáticamente si tienes el ValidationPipe configurado globalmente.

export class CreateAffiliateDto {
  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsString()
  @IsNotEmpty()
  id: string; // ID único como 'AP-001'

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  ci: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  original_affiliate_name?: string = '-';

  @IsString()
  @IsOptional()
  current_affiliate_name?: string = '-';

  @IsUrl()
  @IsOptional()
  profile_photo_url?: string;

  @IsUrl()
  @IsOptional()
  credential_photo_url?: string;

  @IsArray()
  @IsString({ each: true }) // Valida que cada elemento del array sea un string
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  total_paid?: number = 0.0;

  @IsNumber()
  @IsOptional()
  total_debt?: number = 0.0;
}