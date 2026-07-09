import { User } from '@/modules/user/domain/entities/user.entity';
import { QuotaBalance } from '@/modules/user/domain/value-objects/quota-balance.vo';
import { RefundQuotaUseCase } from '@/modules/user/application/use-cases/refund-quota.use-case';

describe('RefundQuotaUseCase', () => {
  let useCase: RefundQuotaUseCase;
  let mockRepo: {
    findById: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    useCase = new RefundQuotaUseCase(mockRepo as never);
  });

  it('should refund one unit of quota by default', async () => {
    const user = User.reconstitute({
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'test',
      quotaRemaining: new QuotaBalance(3),
    });
    mockRepo.findById.mockResolvedValue(user);
    mockRepo.save.mockResolvedValue(user);

    await useCase.execute('user-1');

    expect(user.quotaRemaining.amount).toBe(4);
    expect(mockRepo.save).toHaveBeenCalledWith(user);
  });
});
