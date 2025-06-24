import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn()
  uuid: string;

  @Column({ unique: true })
  user_name: string;

  @Column()
  password_hash: string;

  @Column({ unique: true }) // Generalmente el correo también es único
  email: string; // Nueva columna para el correo

  @Column()
  role: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}