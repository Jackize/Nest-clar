import crypto from 'crypto';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { TokenExpiredException } from '../../domain/exceptions/token-expired.exception';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { TokenPayload, TokenServicePort } from '../ports/token-service.port';

export type RefreshTokenInput = {
  refreshToken: string;
};

export type RefreshTokenOutput = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class RefreshTokenUseCase {
  constructor(
    private readonly tokenService: TokenServicePort,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    let payload: TokenPayload;
    try {
      payload = this.tokenService.verifyRefreshToken(input.refreshToken);
    } catch {
      throw new TokenExpiredException();
    }

    const stored = await this.refreshTokenRepository.findByToken(input.refreshToken);

    if (!stored) {
      await this.refreshTokenRepository.revokeAllForUser(payload.sub);
      throw new TokenExpiredException();
    }

    if (stored.isRevoked() || stored.isExpired()) {
      if (stored.isRevoked()) {
        await this.refreshTokenRepository.revokeAllForUser(payload.sub);
      }
      throw new TokenExpiredException();
    }

    stored.revoke();
    await this.refreshTokenRepository.save(stored);

    const newPayload: TokenPayload = { sub: payload.sub, email: payload.email };
    const accessToken = this.tokenService.signAccessToken(newPayload);
    const newRefreshToken = this.tokenService.signRefreshToken(newPayload);

    const newEntity = new RefreshTokenEntity(
      crypto.randomUUID(),
      newRefreshToken,
      payload.sub,
      new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      false,
    );
    await this.refreshTokenRepository.save(newEntity);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
