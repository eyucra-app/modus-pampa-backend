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

  @Column('float', { nullable: true})
  amount_paid?: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'boolean', default: false }) 
  is_paid: boolean;

  @Column({ default: 'Varios' })
  category: string;

  // Columna para el UUID de la lista de asistencia relacionada
  @Column({ name: 'related_attendance_uuid', type: 'uuid', nullable: true })
  related_attendance_uuid: string | null;

  // Relación: Muchas multas pueden pertenecer a un afiliado.
  @Column()
  affiliate_uuid: string; // Almacenamos el UUID del afiliado

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' }) // Si se borra el afiliado, se borran sus multas
  @JoinColumn({ name: 'affiliate_uuid' }) // La columna que establece la relación
  affiliate: AffiliateEntity;
    
  // Columnas para sincronización
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}