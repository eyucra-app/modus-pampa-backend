import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para un enlace individual al crear una contribución
class CreateContributionLinkDto {
  @IsUUID()
  uuid: string;

  @IsUUID()
  affiliate_uuid: string;

  @IsNumber()
  amount_to_pay: number;
}

export class CreateContributionDto {
  @IsUUID()
  uuid: string;

  @IsString()
  name: string;

  @IsDateString()
  date: string;

  @IsNumber()
  default_amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContributionLinkDto)
  links: CreateContributionLinkDto[];
}