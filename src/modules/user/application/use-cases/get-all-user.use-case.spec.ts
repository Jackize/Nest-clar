import { DomainError } from '@/common/errors/domain.error';
import { GetAllUserUseCase } from './get-all-user.use-case';

describe('GetAllUserUseCase', () => {
  let useCase: GetAllUserUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
    };

    useCase = new GetAllUserUseCase(mockRepo);
  });

  it('should get all users successfully', async () => {
    mockRepo.findAll.mockResolvedValue([
      {
        id: '1',
        email: 'test@example.com',
        name: 'Test User 1',
      },
      {
        id: '2',
        email: 'test2@example.com',
        name: 'Test User 2',
      },
    ]);

    const result = await useCase.execute(1, 10, 'asc');

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[0].email).toBe('test@example.com');
    expect(result[0].name).toBe('Test User 1');
    expect(result[1].id).toBe('2');
    expect(result[1].email).toBe('test2@example.com');
    expect(result[1].name).toBe('Test User 2');
    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(mockRepo.findAll).toHaveBeenCalledWith(1, 10, 'asc');
  });

  it('should throw error if user not found', async () => {
    mockRepo.findAll.mockResolvedValue(null);

    await expect(useCase.execute(1, 10, 'asc')).rejects.toThrow(DomainError);
  });
});
