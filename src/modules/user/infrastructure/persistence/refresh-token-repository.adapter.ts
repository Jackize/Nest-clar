import { RefreshTokenRepositoryPort } from '@/modules/user/application/ports/refresh-token-repository.port';
import { TypeormRefreshTokenRepository } from '@/modules/auth/infrastructure/persistence/typeorm-refresh-token.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenRepositoryAdapter implements RefreshTokenRepositoryPort {
  constructor(private readonly refreshTokenRepository: TypeormRefreshTokenRepository) {}

  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(userId);
  }
}
