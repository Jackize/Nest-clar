import { UserOrmEntity } from '@/modules/user/infrastructure/typeorm/entities/user.orm-entity';
import type { DataSourceOptions } from 'typeorm';

export function buildTypeOrmOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DB ?? 'nest_clar',
    entities: [UserOrmEntity],
    synchronize: process.env.NODE_ENV === 'development',
  };
}
