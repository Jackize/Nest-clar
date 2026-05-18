import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function createTypeOrmOptions(
  config: ConfigService,
): TypeOrmModuleOptions {
  const nodeEnv = config.get<string>('NODE_ENV', 'development');

  return {
    type: 'postgres',
    host: config.get<string>('POSTGRES_HOST', 'localhost'),
    port: Number.parseInt(
      config.get<string>('POSTGRES_PORT', '5432'),
      10,
    ),
    username: config.get<string>('POSTGRES_USER', 'postgres'),
    password: config.get<string>('POSTGRES_PASSWORD', 'postgres'),
    database: config.get<string>('POSTGRES_DB', 'nestjs_clar'),
    autoLoadEntities: true,
    synchronize: config.get<string>('TYPEORM_SYNC', 'false') === 'true',
    logging: nodeEnv !== 'production',
  };
}
