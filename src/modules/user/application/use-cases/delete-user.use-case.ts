import { UserNotFoundException } from '@/modules/user/domain/exceptions/user-not-found.exception';
import type { RefreshTokenRepositoryPort } from '@/modules/user/application/ports/refresh-token-repository.port';
import type { IUserRepository } from '@/modules/user/domain/repositories/user-repository.interface';
import { REFRESH_TOKEN_REPOSITORY_PORT, USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY_PORT)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.refreshTokenRepository.revokeAllForUser(userId);
    await this.userRepository.softDelete(userId);
  }
}
