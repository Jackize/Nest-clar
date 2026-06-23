import { CommonHttpModule } from '@/common/http/common-http.module';
import { DatabaseModule } from '@/database/database.module';
import { createTypeOrmOptions } from '@/database/typeorm-options.factory';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    DatabaseModule,
    HealthCheckModule,
    CommonHttpModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
