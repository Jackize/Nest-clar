import { DomainError } from '@/common/errors/domain.error';
import { DeleteUserByIdUseCase } from './delete-user-by-id.use-case';

describe('DeleteUserByIdUseCase', () => {
  let useCase: DeleteUserByIdUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      delete: jest.fn(),
    };

    useCase = new DeleteUserByIdUseCase(mockRepo);
  });

  it('should delete user by id successfully', async () => {
    mockRepo.delete.mockResolvedValue(true);

    const result = await useCase.execute('1');

    expect(result).toBe(true);
    expect(mockRepo.delete).toHaveBeenCalled();
  });

  it('should throw error if user not found', async () => {
    mockRepo.delete.mockResolvedValue(false);

    await expect(useCase.execute('1')).rejects.toThrow(DomainError);
  });
});
