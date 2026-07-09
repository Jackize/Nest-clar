import { InsufficientQuotaException } from '@/modules/user/domain/exceptions/insufficient-quota.exception';
import { InvalidQuotaException } from '@/modules/user/domain/exceptions/invalid-quota.exception';
import { QuotaBalance } from '@/modules/user/domain/value-objects/quota-balance.vo';

describe('QuotaBalance', () => {
  it('should throw when initialized with a negative value', () => {
    expect(() => new QuotaBalance(-1)).toThrow(InvalidQuotaException);
  });

  it('should accept zero as a valid balance', () => {
    const balance = new QuotaBalance(0);
    expect(balance.amount).toBe(0);
  });

  it('should throw InsufficientQuotaException when decrementing from zero', () => {
    const balance = new QuotaBalance(0);
    expect(() => balance.decrement()).toThrow(InsufficientQuotaException);
  });

  it('should decrement correctly when balance is greater than zero', () => {
    const balance = new QuotaBalance(5);
    expect(balance.decrement().amount).toBe(4);
  });

  it('should increment without an upper limit', () => {
    const balance = new QuotaBalance(0);
    expect(balance.increment().amount).toBe(1);
    expect(balance.increment(100).amount).toBe(100);
  });

  it('should handle large values', () => {
    const balance = new QuotaBalance(Number.MAX_SAFE_INTEGER);
    expect(balance.increment().amount).toBe(Number.MAX_SAFE_INTEGER + 1);
  });
});
