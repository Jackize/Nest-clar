import { UserDomainException } from './user-domain.exception';

export class InsufficientQuotaException extends UserDomainException {
  constructor() {
    super('Insufficient quota', 'INSUFFICIENT_QUOTA');
  }
}
