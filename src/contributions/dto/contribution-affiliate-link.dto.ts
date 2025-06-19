import { IsUUID, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class ContributionAffiliateLinkDto {
  @IsUUID()
  affiliateUuid: string;

  @IsNumber()
  amountToPay: number;

  @IsNumber()
  @IsOptional()
  amountPaid?: number = 0.0;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean = false;
}