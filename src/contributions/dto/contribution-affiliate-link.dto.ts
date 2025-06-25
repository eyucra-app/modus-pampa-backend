import { IsUUID, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class ContributionAffiliateLinkDto {

  @IsUUID()
  @IsNotEmpty()
  uuid: string;

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