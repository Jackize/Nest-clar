import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { UserRepositoryPort } from '../ports/user-repository.port';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };
    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('should hash password before saving user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 'user-1', email: 'test@example.com' });

    await useCase.execute({ email: 'test@example.com', password: 'password123' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should throw when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

    await expect(useCase.execute({ email: 'test@example.com', password: 'password123' })).rejects.toThrow(
      EmailAlreadyExistsException,
    );
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });
});
