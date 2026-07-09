import { UserNotFoundException } from '@/modules/user/domain/exceptions/user-not-found.exception';
import { User } from '@/modules/user/domain/entities/user.entity';
import { DeleteUserUseCase } from '@/modules/user/application/use-cases/delete-user.use-case';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepo: {
    findById: jest.Mock;
    softDelete: jest.Mock;
  };
  let mockRefreshTokenRepo: {
    revokeAllForUser: jest.Mock;
  };

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };
    mockRefreshTokenRepo = {
      revokeAllForUser: jest.fn(),
    };
    useCase = new DeleteUserUseCase(mockUserRepo as never, mockRefreshTokenRepo as never);
  });

  it('should revoke refresh tokens and soft delete the user', async () => {
    mockUserRepo.findById.mockResolvedValue(User.create({ id: 'user-1', email: 'test@example.com' }));
    mockRefreshTokenRepo.revokeAllForUser.mockResolvedValue(undefined);
    mockUserRepo.softDelete.mockResolvedValue(true);

    await useCase.execute('user-1');

    expect(mockRefreshTokenRepo.revokeAllForUser).toHaveBeenCalledWith('user-1');
    expect(mockUserRepo.softDelete).toHaveBeenCalledWith('user-1');
  });

  it('should throw when user does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toThrow(UserNotFoundException);
    expect(mockRefreshTokenRepo.revokeAllForUser).not.toHaveBeenCalled();
  });
});
