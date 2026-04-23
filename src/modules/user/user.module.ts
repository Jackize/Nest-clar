import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl';
import { UserController } from './interfaces/controllers/user.controller';
import { USER_REPOSITORY } from './user.di-token';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    UserRepositoryImpl,
    {
      provide: USER_REPOSITORY,
      useExisting: UserRepositoryImpl,
    },
  ],
})
export class UserModule {}
