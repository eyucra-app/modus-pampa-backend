import { Entity, Column, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'configurations' }) // Se agrega el decorador @Entity
export class Configuration {

     @PrimaryColumn({default: 1})
     id:number

     @Column('float',{default: 5.0, nullable:true})
     monto_multa_retraso?: number

     @Column('float',{default: 20.0, nullable:true})
     monto_multa_falta?: number

     @Column({nullable: true})
     backend_url?: string

     // Columnas para sincronización
     @CreateDateColumn({ type: 'timestamp with time zone' })
     created_at: Date;

     @UpdateDateColumn({ type: 'timestamp with time zone' })
     updated_at: Date;

}