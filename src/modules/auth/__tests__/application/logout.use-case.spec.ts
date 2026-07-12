import { RefreshTokenEntity } from '@/modules/auth/domain/entities/refresh-token.entity';
import { TokenExpiredException } from '@/modules/auth/domain/exceptions/token-expired.exception';
import { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository.interface';
import { TokenServicePort } from '@/modules/auth/application/ports/token-service.port';
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let tokenService: jest.Mocked<TokenServicePort>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(() => {
    tokenService = {
      signAccessToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn().mockReturnValue({ sub: 'user-1', email: 'test@example.com' }),
    };
    refreshTokenRepository = {
      save: jest.fn().mockImplementation(async (token) => token),
      findByToken: jest.fn(),
      revokeAllForUser: jest.fn(),
    };
    useCase = new LogoutUseCase(tokenService, refreshTokenRepository);
  });

  it('should revoke a single refresh token', async () => {
    const stored = new RefreshTokenEntity('id-1', 'refresh-token', 'user-1', new Date(Date.now() + 60_000), false);
    refreshTokenRepository.findByToken.mockResolvedValue(stored);

    await useCase.execute({ refreshToken: 'refresh-token' });

    expect(stored.isRevoked()).toBe(true);
    expect(refreshTokenRepository.save).toHaveBeenCalledWith(stored);
    expect(refreshTokenRepository.revokeAllForUser).not.toHaveBeenCalled();
  });

  it('should revoke all tokens when logoutAllDevices is true', async () => {
    await useCase.execute({ refreshToken: 'refresh-token', logoutAllDevices: true });

    expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('should throw when refresh token is missing or already revoked', async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute({ refreshToken: 'missing-token' })).rejects.toThrow(TokenExpiredException);
  });
});
