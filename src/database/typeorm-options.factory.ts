import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions';

function isTruthy(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

function getPostgresCredentials(
  config: ConfigService,
): Pick<PostgresConnectionCredentialsOptions, 'username' | 'password' | 'database'> {
  return {
    username: config.get<string>('POSTGRES_USER', 'postgres'),
    password: config.get<string>('POSTGRES_PASSWORD', 'postgres'),
    database: config.get<string>('POSTGRES_DB', 'nestjs_clar'),
  };
}

function getCommonOptions(
  config: ConfigService,
): Pick<TypeOrmModuleOptions, 'autoLoadEntities' | 'synchronize' | 'logging'> {
  const nodeEnv = config.get<string>('NODE_ENV', 'development');

  return {
    autoLoadEntities: true,
    synchronize: nodeEnv !== 'production' && config.get<string>('TYPEORM_SYNC', 'false') === 'true',
    logging: nodeEnv !== 'production',
  };
}

function createReplicationOptions(config: ConfigService): TypeOrmModuleOptions {
  const credentials = getPostgresCredentials(config);

  const master: PostgresConnectionCredentialsOptions = {
    ...credentials,
    host: config.get<string>('POSTGRES_HOST', 'localhost'),
    port: Number.parseInt(config.get<string>('POSTGRES_PORT', '5432'), 10),
  };

  const slaves: PostgresConnectionCredentialsOptions[] = [
    {
      ...credentials,
      host: config.get<string>('POSTGRES_REPLICA_1_HOST', 'localhost'),
      port: Number.parseInt(config.get<string>('POSTGRES_REPLICA_1_PORT', '5433'), 10),
    },
    {
      ...credentials,
      host: config.get<string>('POSTGRES_REPLICA_2_HOST', 'localhost'),
      port: Number.parseInt(config.get<string>('POSTGRES_REPLICA_2_PORT', '5434'), 10),
    },
  ];

  return {
    type: 'postgres',
    /**
     * Replication setup.
     * @see https://typeorm.io/replication
     */
    replication: {
      master,
      slaves,
    },
    ...getCommonOptions(config),
  };
}

export function createTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  if (isTruthy(config.get<string>('POSTGRES_REPLICATION'))) {
    return createReplicationOptions(config);
  }

  const credentials = getPostgresCredentials(config);

  return {
    type: 'postgres',
    host: config.get<string>('POSTGRES_HOST', 'localhost'),
    port: Number.parseInt(config.get<string>('POSTGRES_PORT', '5432'), 10),
    ...credentials,
    ...getCommonOptions(config),
  };
}
