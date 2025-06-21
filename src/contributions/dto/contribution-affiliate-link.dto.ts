import { IsUUID, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class ContributionAffiliateLinkDto {
  @IsUUID()
  affiliate_uuid: string;

  @IsNumber()
  amount_to_pay: number;

  @IsNumber()
  @IsOptional()
  amount_paid?: number = 0.0;

  @IsBoolean()
  @IsOptional()
  is_paid?: boolean = false;
}