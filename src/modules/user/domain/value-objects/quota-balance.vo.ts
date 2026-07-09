import { InsufficientQuotaException } from '../exceptions/insufficient-quota.exception';
import { InvalidQuotaException } from '../exceptions/invalid-quota.exception';

export class QuotaBalance {
  constructor(private readonly value: number) {
    if (value < 0) {
      throw new InvalidQuotaException();
    }
  }

  get amount(): number {
    return this.value;
  }

  decrement(): QuotaBalance {
    if (this.value === 0) {
      throw new InsufficientQuotaException();
    }
    return new QuotaBalance(this.value - 1);
  }

  increment(amount = 1): QuotaBalance {
    return new QuotaBalance(this.value + amount);
  }
}
