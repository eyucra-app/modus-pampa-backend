import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga las variables de .env

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { // Configuración para Neon
    rejectUnauthorized: false,
  },
  entities: ['dist/**/*.entity.js'], // Apunta a las entidades compiladas
  migrations: ['dist/db/migrations/*.js'], // Dónde buscar migraciones
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;