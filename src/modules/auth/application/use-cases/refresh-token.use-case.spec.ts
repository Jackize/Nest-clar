import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { TokenExpiredException } from '../../domain/exceptions/token-expired.exception';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { TokenServicePort } from '../ports/token-service.port';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let tokenService: jest.Mocked<TokenServicePort>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  const payload = { sub: 'user-1', email: 'test@example.com' };

  beforeEach(() => {
    tokenService = {
      signAccessToken: jest.fn().mockReturnValue('new-access'),
      signRefreshToken: jest.fn().mockReturnValue('new-refresh'),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn().mockReturnValue(payload),
    };
    refreshTokenRepository = {
      save: jest.fn().mockImplementation(async (token) => token),
      findByToken: jest.fn(),
      revokeAllForUser: jest.fn(),
    };
    useCase = new RefreshTokenUseCase(tokenService, refreshTokenRepository);
  });

  it('should rotate refresh token on success', async () => {
    const stored = new RefreshTokenEntity(
      'id-1',
      'old-refresh',
      'user-1',
      new Date(Date.now() + 60_000),
      false,
    );
    refreshTokenRepository.findByToken.mockResolvedValue(stored);

    const result = await useCase.execute({ refreshToken: 'old-refresh' });

    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
    expect(stored.isRevoked()).toBe(true);
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(2);
  });

  it('should throw when token is expired', async () => {
    const stored = new RefreshTokenEntity('id-1', 'old-refresh', 'user-1', new Date(Date.now() - 1000), false);
    refreshTokenRepository.findByToken.mockResolvedValue(stored);

    await expect(useCase.execute({ refreshToken: 'old-refresh' })).rejects.toThrow(TokenExpiredException);
  });

  it('should throw and revoke all when token is already revoked', async () => {
    const stored = new RefreshTokenEntity(
      'id-1',
      'old-refresh',
      'user-1',
      new Date(Date.now() + 60_000),
      true,
    );
    refreshTokenRepository.findByToken.mockResolvedValue(stored);

    await expect(useCase.execute({ refreshToken: 'old-refresh' })).rejects.toThrow(TokenExpiredException);
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('should revoke all tokens when reused after rotation', async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'stolen-refresh' })).rejects.toThrow(TokenExpiredException);
    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });
});
