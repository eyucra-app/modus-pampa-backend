// src/contributions/dto/patch-contribution-link.dto.ts
import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class PatchContributionLinkDto {
  @IsNumber()
  @IsOptional()
  amount_paid?: number;

  @IsBoolean()
  @IsOptional()
  is_paid?: boolean;
}