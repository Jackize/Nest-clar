import { DomainError } from '@/common/errors/domain.error';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new CreateUserUseCase(mockRepo);
  });

  it('should create user successfully', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.save.mockImplementation(async (user: any) => user);

    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('test user');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should throw error if email exists', async () => {
    mockRepo.findByEmail.mockResolvedValue({});

    await expect(
      useCase.execute({
        email: 'test@example.com',
        name: 'Test User',
      }),
    ).rejects.toThrow(DomainError);
  });
});
