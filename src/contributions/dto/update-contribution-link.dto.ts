// src/contributions/dto/update-contribution-link.dto.ts
import { IsNotEmpty, IsNumber, IsBoolean, IsInt, IsUUID } from 'class-validator';

export class UpdateContributionLinkDto {
  @IsUUID()
  @IsNotEmpty()
  contribution_uuid: string;

  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string;

  @IsNumber()
  amount_paid: number;

  @IsBoolean()
  is_paid: boolean;
}