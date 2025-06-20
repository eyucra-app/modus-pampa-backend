import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// Importar entidad de afiliado

@Entity({ name: 'fines' })
export class FineEntity {
  @PrimaryColumn()
  uuid: string;

  @Column()
  description: string;

  @Column('float')
  amount: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  status: string; // Ej: 'pending', 'paid'

  // Relación: Muchas multas pueden pertenecer a un afiliado.
  @Column()
  affiliateId: string; // Almacenamos el UUID del afiliado

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' }) // Si se borra el afiliado, se borran sus multas
  @JoinColumn({ name: 'affiliateId' }) // La columna que establece la relación
  affiliate: AffiliateEntity;
    
  // Columnas para sincronización
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}