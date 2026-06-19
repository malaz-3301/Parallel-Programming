import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigSetModule } from './config-set.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigSetModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction =
          (config.get<string>('NODE_ENV') ?? process.env.NODE_ENV) ===
          'production';

        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST') ?? 'localhost',
          port: Number(config.get<string>('DB_PORT') ?? 5432),
          username:
            config.get<string>('DB_USERNAME') ??
            config.get<string>('DB_USER') ??
            'postgres',
          password: config.get<string>('DB_PASSWORD') ?? 'postgres',
          database:
            config.get<string>('DB_DATABASE') ??
            config.get<string>('DB_NAME') ??
            config.get<string>('DATABASE_NAME') ??
            'parallel_ecommerce',
          autoLoadEntities: true,
          synchronize:
            (config.get<string>('DB_SYNCHRONIZE') ??
              (isProduction ? 'false' : 'true')) === 'true',
          extra: {
            max: Number(config.get<string>('DB_POOL_MAX') ?? 10),
            connectionTimeoutMillis: Number(
              config.get<string>('DB_CONNECTION_TIMEOUT_MS') ?? 5000,
            ),
          },
        };
      },
    }),
  ],
})
export class PostgresSetModule {}
