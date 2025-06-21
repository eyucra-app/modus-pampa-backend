import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ContributionEntity } from './contribution.entity';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';

@Entity({ name: 'contribution_affiliates' })
export class ContributionAffiliateLinkEntity {
  // Clave primaria compuesta
  @PrimaryColumn({ type: 'int' })
  contributionId: number;

  @PrimaryColumn({ type: 'uuid' })
  affiliate_uuid: string;

  @Column({ name: 'amount_to_pay', type: 'float' })
  amount_to_pay: number;

  @Column({ name: 'amount_paid', type: 'float', default: 0.0 })
  amount_paid: number;

  @Column({ name: 'is_paid', default: false })
  is_paid: boolean;

  // Relaciones
  @ManyToOne(() => ContributionEntity, contribution => contribution.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contributionId' })
  contribution: ContributionEntity;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_uuid' })
  affiliate: AffiliateEntity;
}