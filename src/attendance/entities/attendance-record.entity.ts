import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AttendanceListEntity } from './attendance-list.entity';
import { AffiliateEntity } from 'src/affiliates/entities/affiliate.entity';

@Entity({ name: 'attendance_records' })
export class AttendanceRecordEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Claves foráneas
  @Column({ name: 'list_id' })
  listId: number;

  @Column({ name: 'affiliate_uuid' })
  affiliateUuid: string;

  @Column({ name: 'registered_at', type: 'timestamp with time zone' })
  registeredAt: Date;

  @Column()
  status: string; // 'PRESENTE', 'RETRASO', etc.

  // Relaciones
  @ManyToOne(() => AttendanceListEntity, list => list.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'list_id' })
  attendanceList: AttendanceListEntity;

  @ManyToOne(() => AffiliateEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'affiliate_uuid' })
  affiliate: AffiliateEntity;
}