// src/contributions/dto/update-contribution-link.dto.ts
import { IsNotEmpty, IsNumber, IsBoolean, IsInt, IsUUID, IsOptional } from 'class-validator';

export class UpdateContributionLinkDto {

  @IsUUID()
  @IsNotEmpty()
  uuid: string;

  @IsUUID()
  @IsNotEmpty()
  contribution_uuid: string;

  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string;

  @IsNumber()
  @IsOptional() // Hacemos el campo opcional
  amount_to_pay?: number;

  @IsNumber()
  @IsOptional() // Hacemos el campo opcional
  amount_paid: number;

  @IsBoolean()
  @IsOptional() // Hacemos el campo opcional
  is_paid: boolean;
}