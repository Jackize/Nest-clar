import { User } from '@/modules/user/domain/entities/user.entity';
import { UpdateUserProfileUseCase } from '@/modules/user/application/use-cases/update-user-profile.use-case';

describe('UpdateUserProfileUseCase', () => {
  let useCase: UpdateUserProfileUseCase;
  let mockRepo: {
    findById: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    useCase = new UpdateUserProfileUseCase(mockRepo as never);
  });

  it('should update profile for the requesting user', async () => {
    const user = User.create({ id: 'user-1', email: 'test@example.com' });
    mockRepo.findById.mockResolvedValue(user);
    mockRepo.save.mockImplementation(async (saved: User) => saved);

    const result = await useCase.execute('user-1', {
      displayName: 'Updated Name',
      avatarUrl: 'https://example.com/avatar.png',
    });

    expect(result.displayName).toBe('Updated Name');
    expect(result.avatarUrl).toBe('https://example.com/avatar.png');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});
