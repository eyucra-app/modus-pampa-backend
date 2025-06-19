import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ContributionAffiliateLinkDto } from './contribution-affiliate-link.dto';

export class CreateContributionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsNumber()
  defaultAmount: number;

  @IsBoolean()
  @IsOptional()
  isGeneral?: boolean = true;

  // El DTO para la creación/actualización contendrá la lista de enlaces
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContributionAffiliateLinkDto)
  links: ContributionAffiliateLinkDto[];
}