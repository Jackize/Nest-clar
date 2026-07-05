import { TokenExpiredException } from '../../domain/exceptions/token-expired.exception';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { TokenServicePort } from '../ports/token-service.port';

export type LogoutInput = {
  refreshToken: string;
  logoutAllDevices?: boolean;
};

export class LogoutUseCase {
  constructor(
    private readonly tokenService: TokenServicePort,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    if (input.logoutAllDevices) {
      let userId: string;
      try {
        userId = this.tokenService.verifyRefreshToken(input.refreshToken).sub;
      } catch {
        throw new TokenExpiredException();
      }
      await this.refreshTokenRepository.revokeAllForUser(userId);
      return;
    }

    const stored = await this.refreshTokenRepository.findByToken(input.refreshToken);
    if (!stored || stored.isRevoked()) {
      throw new TokenExpiredException();
    }

    stored.revoke();
    await this.refreshTokenRepository.save(stored);
  }
}
