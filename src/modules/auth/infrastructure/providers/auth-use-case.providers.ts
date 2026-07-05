import type { PasswordHasherPort } from '@/modules/auth/application/ports/password-hasher.port';
import type { TokenServicePort } from '@/modules/auth/application/ports/token-service.port';
import type { UserRepositoryPort } from '@/modules/auth/application/ports/user-repository.port';
import { LoginUserUseCase } from '@/modules/auth/application/use-cases/login-user.use-case';
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from '@/modules/auth/application/use-cases/register-user.use-case';
import { ValidateUserUseCase } from '@/modules/auth/application/use-cases/validate-user.use-case';
import {
  PASSWORD_HASHER_PORT,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE_PORT,
  USER_REPOSITORY_PORT,
} from '@/modules/auth/auth.di-token';
import type { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RegisterUserUseCaseProvider {
  constructor(
    @Inject(USER_REPOSITORY_PORT) userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT) passwordHasher: PasswordHasherPort,
  ) {
    this.useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  }

  readonly useCase: RegisterUserUseCase;
}

@Injectable()
export class LoginUserUseCaseProvider {
  constructor(
    @Inject(USER_REPOSITORY_PORT) userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER_PORT) passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE_PORT) tokenService: TokenServicePort,
    @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokenRepository: IRefreshTokenRepository,
  ) {
    this.useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService, refreshTokenRepository);
  }

  readonly useCase: LoginUserUseCase;
}

@Injectable()
export class RefreshTokenUseCaseProvider {
  constructor(
    @Inject(TOKEN_SERVICE_PORT) tokenService: TokenServicePort,
    @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokenRepository: IRefreshTokenRepository,
  ) {
    this.useCase = new RefreshTokenUseCase(tokenService, refreshTokenRepository);
  }

  readonly useCase: RefreshTokenUseCase;
}

@Injectable()
export class LogoutUseCaseProvider {
  constructor(
    @Inject(TOKEN_SERVICE_PORT) tokenService: TokenServicePort,
    @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokenRepository: IRefreshTokenRepository,
  ) {
    this.useCase = new LogoutUseCase(tokenService, refreshTokenRepository);
  }

  readonly useCase: LogoutUseCase;
}

@Injectable()
export class ValidateUserUseCaseProvider {
  constructor(@Inject(USER_REPOSITORY_PORT) userRepository: UserRepositoryPort) {
    this.useCase = new ValidateUserUseCase(userRepository);
  }

  readonly useCase: ValidateUserUseCase;
}
