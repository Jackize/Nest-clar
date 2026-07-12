import { InvalidCredentialsException } from '@/modules/auth/domain/exceptions/invalid-credentials.exception';
import { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository.interface';
import { PasswordHasherPort } from '@/modules/auth/application/ports/password-hasher.port';
import { TokenServicePort } from '@/modules/auth/application/ports/token-service.port';
import { UserRepositoryPort } from '@/modules/auth/application/ports/user-repository.port';
import { LoginUserUseCase } from '@/modules/auth/application/use-cases/login-user.use-case';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenService: jest.Mocked<TokenServicePort>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    tokenService = {
      signAccessToken: jest.fn().mockReturnValue('access-token'),
      signRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };
    refreshTokenRepository = {
      save: jest.fn().mockImplementation(async (token) => token),
      findByToken: jest.fn(),
      revokeAllForUser: jest.fn(),
    };
    useCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService, refreshTokenRepository);
  });

  it('should throw InvalidCredentialsException when email does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'missing@example.com', password: 'password123' })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw the same InvalidCredentialsException when password is wrong', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
    });
    passwordHasher.compare.mockResolvedValue(false);

    let missingEmailError: InvalidCredentialsException | undefined;
    let wrongPasswordError: InvalidCredentialsException | undefined;

    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.compare.mockResolvedValue(false);
    try {
      await useCase.execute({ email: 'missing@example.com', password: 'password123' });
    } catch (error) {
      missingEmailError = error as InvalidCredentialsException;
    }

    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
    });
    passwordHasher.compare.mockResolvedValue(false);
    try {
      await useCase.execute({ email: 'test@example.com', password: 'wrong' });
    } catch (error) {
      wrongPasswordError = error as InvalidCredentialsException;
    }

    expect(missingEmailError?.message).toBe(wrongPasswordError?.message);
    expect(missingEmailError?.code).toBe(wrongPasswordError?.code);
  });

  it('should sign tokens and persist refresh token on valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
    });
    passwordHasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({ email: 'test@example.com', password: 'password123' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(tokenService.signAccessToken).toHaveBeenCalledTimes(1);
    expect(tokenService.signRefreshToken).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
  });
});
