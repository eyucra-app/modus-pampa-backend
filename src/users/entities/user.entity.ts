import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn()
  uuid: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true }) // Generalmente el correo también es único
  email: string; // Nueva columna para el correo

  @Column()
  role: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}