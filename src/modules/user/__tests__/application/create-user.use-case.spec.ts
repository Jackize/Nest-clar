import { EmailAlreadyExistsException } from '@/modules/user/domain/exceptions/email-already-exists.exception';
import { QuotaBalance } from '@/modules/user/domain/value-objects/quota-balance.vo';
import { User } from '@/modules/user/domain/entities/user.entity';
import { CreateUserUseCase } from '@/modules/user/application/use-cases/create-user.use-case';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepo: {
    findByEmail: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    useCase = new CreateUserUseCase(mockRepo as never);
  });

  it('should call userRepository.save once with default quota', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.save.mockImplementation(async (user: User) => user);

    const result = await useCase.execute({
      email: 'test@example.com',
      passwordHash: 'hashed',
    });

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(result.quotaRemaining).toEqual(new QuotaBalance(10));
  });

  it('should throw when email already exists', async () => {
    mockRepo.findByEmail.mockResolvedValue(User.create({ id: 'existing', email: 'test@example.com' }));

    await expect(
      useCase.execute({
        email: 'test@example.com',
      }),
    ).rejects.toThrow(EmailAlreadyExistsException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
