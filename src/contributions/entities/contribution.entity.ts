import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ContributionAffiliateLinkEntity } from './contribution-affiliate-link.entity';

@Entity({ name: 'contributions' }) // Coincide con la tabla 'contributions'
export class ContributionEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'timestamp with time zone' })
  date: Date;

  // El nombre de la columna coincide con la clave 'total_amount' en tu toMap()
  @Column({ name: 'total_amount', type: 'float' })
  default_amount: number;

  @Column({ name: 'is_general', default: true })
  is_general: boolean;

  // Relación: Una contribución tiene muchos enlaces a afiliados
  @OneToMany(() => ContributionAffiliateLinkEntity, link => link.contribution, { cascade: true })
  links: ContributionAffiliateLinkEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}