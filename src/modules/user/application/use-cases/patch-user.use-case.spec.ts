import { DomainError } from '@/common/errors/domain.error';
import { PatchUserUseCase } from './patch-user.use-case';

describe('PatchUserUseCase', () => {
  let useCase: PatchUserUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      patch: jest.fn(),
    };

    useCase = new PatchUserUseCase(mockRepo);
  });

  it('should patch user successfully', async () => {
    mockRepo.patch.mockResolvedValue({
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
    expect(mockRepo.patch).toHaveBeenCalled();
  });

  it('should throw error if user not found', async () => {
    mockRepo.patch.mockResolvedValue(null);

    await expect(
      useCase.execute('1', {
        email: 'test@example.com',
        name: 'Test User',
      }),
    ).rejects.toThrow(DomainError);
  });
});
