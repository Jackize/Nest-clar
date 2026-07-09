import { InsufficientQuotaException } from '@/modules/user/domain/exceptions/insufficient-quota.exception';
import { User } from '@/modules/user/domain/entities/user.entity';
import { QuotaBalance } from '@/modules/user/domain/value-objects/quota-balance.vo';
import { DeductQuotaUseCase } from '@/modules/user/application/use-cases/deduct-quota.use-case';

describe('DeductQuotaUseCase', () => {
  let useCase: DeductQuotaUseCase;
  let mockRepo: {
    findById: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    useCase = new DeductQuotaUseCase(mockRepo as never);
  });

  it('should deduct quota and save when balance is sufficient', async () => {
    const user = User.reconstitute({
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'test',
      quotaRemaining: new QuotaBalance(5),
    });
    mockRepo.findById.mockResolvedValue(user);
    mockRepo.save.mockResolvedValue(user);

    await useCase.execute('user-1');

    expect(user.quotaRemaining.amount).toBe(4);
    expect(mockRepo.save).toHaveBeenCalledWith(user);
  });

  it('should throw and not save when quota is zero', async () => {
    const user = User.reconstitute({
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'test',
      quotaRemaining: new QuotaBalance(0),
    });
    mockRepo.findById.mockResolvedValue(user);

    await expect(useCase.execute('user-1')).rejects.toThrow(InsufficientQuotaException);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
