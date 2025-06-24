// src/affiliates/affiliate.entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'affiliates' }) // Corresponde a tu tabla `tableAffiliates`
export class AffiliateEntity {
  @PrimaryColumn()
  uuid: string;

  @Column({ unique: true })
  id: string; // ID único como 'AP-001'

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  ci: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: '-' })
  original_affiliate_name: string;

  @Column({ default: '-' })
  current_affiliate_name: string;

  @Column({ nullable: true })
  profile_photo_url?: string;

  @Column({ nullable: true })
  credential_photo_url?: string;

  @Column({ type: 'text', default: '[]' }) 
  tags: string;

  @Column('float', { default: 0.0 })
  total_paid: number;

  @Column('float', { default: 0.0 })
  total_debt: number;

  // Columnas para sincronización
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}