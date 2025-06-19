import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn()
  uuid: string;

  @Column({ unique: true })
  username: string;

  // En una aplicación real, NUNCA guardes la contraseña en texto plano.
  // Usa una librería como bcrypt para hashear la contraseña antes de guardarla.
  @Column()
  password: string;

  @Column()
  role: string; // Ej: 'admin', 'operator'

    // Columnas para sincronización
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}