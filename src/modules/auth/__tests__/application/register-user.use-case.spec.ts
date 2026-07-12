import { EmailAlreadyExistsException } from '@/modules/auth/domain/exceptions/email-already-exists.exception';
import { User } from '@/modules/user/domain/entities/user.entity';
import { CreateUserUseCase } from '@/modules/user/application/use-cases/create-user.use-case';
import { PasswordHasherPort } from '@/modules/auth/application/ports/password-hasher.port';
import { UserRepositoryPort } from '@/modules/auth/application/ports/user-repository.port';
import { RegisterUserUseCase } from '@/modules/auth/application/use-cases/register-user.use-case';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let createUserUseCase: jest.Mocked<Pick<CreateUserUseCase, 'execute'>>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    createUserUseCase = {
      execute: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };
    useCase = new RegisterUserUseCase(
      userRepository,
      createUserUseCase as unknown as CreateUserUseCase,
      passwordHasher,
    );
  });

  it('should not hash password when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

    await expect(useCase.execute({ email: 'test@example.com', password: 'password123' })).rejects.toThrow(
      EmailAlreadyExistsException,
    );
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(createUserUseCase.execute).not.toHaveBeenCalled();
  });

  it('should hash password before saving a new user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    createUserUseCase.execute.mockResolvedValue(
      User.create({ id: 'user-1', email: 'test@example.com', passwordHash: 'hashed-password' }),
    );

    await useCase.execute({ email: 'test@example.com', password: 'password123' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
    expect(createUserUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      displayName: 'test',
    });
  });

  it('should not return tokens after registration', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    createUserUseCase.execute.mockResolvedValue(
      User.create({ id: 'user-1', email: 'test@example.com', passwordHash: 'hashed-password' }),
    );

    const result = await useCase.execute({ email: 'test@example.com', password: 'password123' });

    expect(result).toEqual({ id: 'user-1', email: 'test@example.com' });
    expect(result).not.toHaveProperty('accessToken');
    expect(result).not.toHaveProperty('refreshToken');
  });
});
