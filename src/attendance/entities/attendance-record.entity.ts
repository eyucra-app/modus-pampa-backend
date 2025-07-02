import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryColumn, DeleteDateColumn } from 'typeorm';
import { AttendanceListEntity } from './attendance-list.entity';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';

@Entity({ name: 'attendance_records' })
export class AttendanceRecordEntity {
  @PrimaryColumn('uuid')
  uuid: string;

  @Column({ name: 'list_uuid' })
  list_uuid: string;

  @Column({ name: 'affiliate_uuid' })
  affiliate_uuid: string;

  @Column({ name: 'registered_at', type: 'timestamp with time zone' })
  registered_at: Date;

  @Column()
  status: string; // 'PRESENTE', 'RETRASO', etc.

  // Relaciones
  @ManyToOne(() => AttendanceListEntity, list => list.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'list_uuid', referencedColumnName: 'uuid' })
  attendanceList: AttendanceListEntity;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_uuid', referencedColumnName: 'uuid' })
  affiliate: AffiliateEntity;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
  
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at: Date;
}