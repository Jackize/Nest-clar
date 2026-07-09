import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/modules/auth/auth.module';
import { TypeormRefreshTokenRepository } from '@/modules/auth/infrastructure/persistence/typeorm-refresh-token.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { DeductQuotaUseCase } from './application/use-cases/deduct-quota.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { RefundQuotaUseCase } from './application/use-cases/refund-quota.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';
import { UserDomainErrorHttpStatusRegistrar } from './http/user-domain-error-http-status.registrar';
import { OwnerOrAdminGuard } from './infrastructure/http/owner-or-admin.guard';
import { UsersController } from './infrastructure/http/users.controller';
import { RefreshTokenRepositoryAdapter } from './infrastructure/persistence/refresh-token-repository.adapter';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { TypeormUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { REFRESH_TOKEN_REPOSITORY_PORT, USER_REPOSITORY } from './user.di-token';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [
    UserDomainErrorHttpStatusRegistrar,
    CreateUserUseCase,
    GetUserProfileUseCase,
    UpdateUserProfileUseCase,
    DeductQuotaUseCase,
    RefundQuotaUseCase,
    DeleteUserUseCase,
    TypeormUserRepository,
    OwnerOrAdminGuard,
    {
      provide: USER_REPOSITORY,
      useExisting: TypeormUserRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY_PORT,
      useFactory: (refreshTokenRepository: TypeormRefreshTokenRepository) =>
        new RefreshTokenRepositoryAdapter(refreshTokenRepository),
      inject: [TypeormRefreshTokenRepository],
    },
  ],
  exports: [USER_REPOSITORY, CreateUserUseCase, DeductQuotaUseCase, RefundQuotaUseCase],
})
export class UserModule {}
