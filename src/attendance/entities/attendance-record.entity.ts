import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AttendanceListEntity } from './attendance-list.entity';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';

@Entity({ name: 'attendance_records' })
export class AttendanceRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Claves foráneas
  @Column({ name: 'list_id' })
  list_id: number;

  @Column({ name: 'affiliate_uuid' })
  affiliate_uuid: string;

  @Column({ name: 'registered_at', type: 'timestamp with time zone' })
  registered_at: Date;

  @Column()
  status: string; // 'PRESENTE', 'RETRASO', etc.

  // Timestamps para la sincronización
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => AttendanceListEntity, list => list.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'list_id' })
  attendanceList: AttendanceListEntity;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_uuid' })
  affiliate: AffiliateEntity;
}