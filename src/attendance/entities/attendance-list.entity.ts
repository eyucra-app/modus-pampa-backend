import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryColumn, DeleteDateColumn } from 'typeorm';
import { AttendanceRecordEntity } from './attendance-record.entity';

@Entity({ name: 'attendance_lists' })
export class AttendanceListEntity {
  @PrimaryColumn('uuid')
  uuid: string;

  @Column()
  name: string;

  // El nombre de la columna coincide con la clave 'created_at' en tu toMap()
  @Column({ name: 'created_at', type: 'timestamp with time zone' })
  created_at: Date;

  @Column()
  status: string; // 'PREPARADA', 'INICIADA', etc.

  // Relación: Una lista tiene muchos registros
  @OneToMany(() => AttendanceRecordEntity, record => record.attendanceList, { cascade: true })
  records: AttendanceRecordEntity[];

  // La fecha de actualización nos sirve para la sincronización
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at: Date;
}