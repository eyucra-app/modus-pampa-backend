// src/contributions/dto/update-contribution-link.dto.ts
import { IsNotEmpty, IsNumber, IsBoolean, IsInt, IsUUID } from 'class-validator';

export class UpdateContributionLinkDto {
  @IsInt()
  @IsNotEmpty()
  contribution_id: number;

  @IsUUID()
  @IsNotEmpty()
  affiliate_uuid: string;

  @IsNumber()
  amount_paid: number;

  @IsBoolean()
  is_paid: boolean;
}