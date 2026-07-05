import { UserModule } from '@/modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PASSWORD_HASHER_PORT,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE_PORT,
  USER_REPOSITORY_PORT,
} from '@/modules/auth/auth.di-token';
import { AuthDomainErrorHttpStatusRegistrar } from '@/modules/auth/http/auth-domain-error-http-status.registrar';
import { AuthController } from '@/modules/auth/interfaces/controllers/auth.controller';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/http/jwt-auth.guard';
import { JwtStrategy } from '@/modules/auth/infrastructure/http/jwt.strategy';
import { RefreshTokenOrmEntity } from '@/modules/auth/infrastructure/persistence/refresh-token.orm-entity';
import { TypeormRefreshTokenRepository } from '@/modules/auth/infrastructure/persistence/typeorm-refresh-token.repository';
import { UserRepositoryAuthAdapter } from '@/modules/auth/infrastructure/persistence/user-repository.auth.adapter';
import {
  LoginUserUseCaseProvider,
  LogoutUseCaseProvider,
  RefreshTokenUseCaseProvider,
  RegisterUserUseCaseProvider,
  ValidateUserUseCaseProvider,
} from '@/modules/auth/infrastructure/providers/auth-use-case.providers';
import { BcryptPasswordHasherService } from '@/modules/auth/infrastructure/security/bcrypt-password-hasher.service';
import { JwtTokenService } from '@/modules/auth/infrastructure/security/jwt-token.service';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    TypeOrmModule.forFeature([RefreshTokenOrmEntity]),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthDomainErrorHttpStatusRegistrar,
    BcryptPasswordHasherService,
    JwtTokenService,
    UserRepositoryAuthAdapter,
    TypeormRefreshTokenRepository,
    RegisterUserUseCaseProvider,
    LoginUserUseCaseProvider,
    RefreshTokenUseCaseProvider,
    LogoutUseCaseProvider,
    ValidateUserUseCaseProvider,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: PASSWORD_HASHER_PORT,
      useExisting: BcryptPasswordHasherService,
    },
    {
      provide: TOKEN_SERVICE_PORT,
      useExisting: JwtTokenService,
    },
    {
      provide: USER_REPOSITORY_PORT,
      useExisting: UserRepositoryAuthAdapter,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useExisting: TypeormRefreshTokenRepository,
    },
  ],
  exports: [JwtAuthGuard, JwtModule, TOKEN_SERVICE_PORT],
})
export class AuthModule {}
