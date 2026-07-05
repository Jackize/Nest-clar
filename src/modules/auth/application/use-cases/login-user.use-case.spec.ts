import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { TokenServicePort } from '../ports/token-service.port';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { LoginUserUseCase } from './login-user.use-case';

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

  it('should return tokens on valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
    });
    passwordHasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({ email: 'test@example.com', password: 'password123' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(refreshTokenRepository.save).toHaveBeenCalled();
  });

  it('should throw generic invalid credentials when password is wrong', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed',
    });
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
      InvalidCredentialsException,
    );
    await expect(useCase.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toMatchObject({
      message: 'Email hoặc mật khẩu không đúng',
    });
  });

  it('should throw generic invalid credentials when email does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'missing@example.com', password: 'password123' })).rejects.toThrow(
      InvalidCredentialsException,
    );
    await expect(useCase.execute({ email: 'missing@example.com', password: 'password123' })).rejects.toMatchObject({
      message: 'Email hoặc mật khẩu không đúng',
    });
  });
});
