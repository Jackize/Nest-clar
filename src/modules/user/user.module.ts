import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { DeleteUserByIdUseCase } from './application/use-cases/delete-user-by-id.use-case';
import { GetAllUserUseCase } from './application/use-cases/get-all-user.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { PatchUserUseCase } from './application/use-cases/patch-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UserDomainErrorHttpStatusRegistrar } from './http/user-domain-error-http-status.registrar';
import { UserRepositoryTypeORMImpl } from './infrastructure/repositories/user.repository.typeorm.impl';
import { UserOrmEntity } from './infrastructure/typeorm/entities/user.orm-entity';
import { UserController } from './interfaces/controllers/user.controller';
import { USER_REPOSITORY } from './user.di-token';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [
    UserDomainErrorHttpStatusRegistrar,
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetAllUserUseCase,
    UpdateUserUseCase,
    PatchUserUseCase,
    DeleteUserByIdUseCase,
    UserRepositoryTypeORMImpl,
    {
      provide: USER_REPOSITORY,
      useExisting: UserRepositoryTypeORMImpl,
    },
  ],
})
export class UserModule {}
