import { DomainError } from '@/common/errors/domain.error';
import { UpdateUserUseCase } from './update-user.use-case';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      update: jest.fn(),
    };

    useCase = new UpdateUserUseCase(mockRepo);
  });

  it('should update user successfully', async () => {
    mockRepo.update.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    });

    const result = await useCase.execute('1', {
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('1');
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(mockRepo.update).toHaveBeenCalled();
  });

  it('should throw error if user not found', async () => {
    mockRepo.update.mockResolvedValue(null);

    await expect(
      useCase.execute('1', {
        email: 'test@example.com',
        name: 'Test User',
      }),
    ).rejects.toThrow(DomainError);
  });
});
