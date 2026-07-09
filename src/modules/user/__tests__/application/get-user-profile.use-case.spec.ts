import { UserNotFoundException } from '@/modules/user/domain/exceptions/user-not-found.exception';
import { User } from '@/modules/user/domain/entities/user.entity';
import { GetUserProfileUseCase } from '@/modules/user/application/use-cases/get-user-profile.use-case';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let mockRepo: {
    findById: jest.Mock;
  };

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
    };
    useCase = new GetUserProfileUseCase(mockRepo as never);
  });

  it('should throw UserNotFoundException when user does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(UserNotFoundException);
  });

  it('should not expose passwordHash in the response', async () => {
    mockRepo.findById.mockResolvedValue(
      User.create({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'secret-hash',
      }),
    );

    const result = await useCase.execute('user-1');

    expect(result).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'test',
      avatarUrl: null,
      quotaRemaining: 10,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
