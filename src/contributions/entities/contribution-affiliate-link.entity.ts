import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContributionEntity } from './contribution.entity';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';

@Entity({ name: 'contribution_affiliates' })
export class ContributionAffiliateLinkEntity {

  // 1. Añadimos un UUID como clave primaria única para cada enlace.
  @PrimaryColumn({ type: 'uuid' })
  uuid: string;
  
  // 2. Mantenemos las relaciones con UUIDs.
  @Column({ type: 'uuid' })
  contribution_uuid: string;

  @Column({ type: 'uuid' })
  affiliate_uuid: string;

  @Column({ type: 'float' })
  amount_to_pay: number;

  @Column({ type: 'float', default: 0.0 })
  amount_paid: number;

  @Column({ default: false })
  is_paid: boolean;
  
  // 3. Añadimos timestamps para la sincronización.
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;


  // --- RELACIONES ---
  @ManyToOne(() => ContributionEntity, contribution => contribution.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contribution_uuid', referencedColumnName: 'uuid' }) // Unir por UUID
  contribution: ContributionEntity;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_uuid', referencedColumnName: 'uuid' }) // Unir por UUID
  affiliate: AffiliateEntity;
}