import { DomainError } from '@/common/errors/domain.error';
import { GetUserByIdUseCase } from './get-user-by-id.use-case';

describe('GetUserByIdUseCase', () => {
  let useCase: GetUserByIdUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
    };

    useCase = new GetUserByIdUseCase(mockRepo);
  });

  it('should get user by id successfully', async () => {
    mockRepo.findById.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    });

    const result = await useCase.execute('1');

    expect(result).toBeDefined();
    expect(result.id).toBe('1');
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(mockRepo.findById).toHaveBeenCalled();
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
  });

  it('should throw error if user not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('1')).rejects.toThrow(DomainError);
  });
});
