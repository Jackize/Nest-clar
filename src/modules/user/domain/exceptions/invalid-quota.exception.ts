import { UserDomainException } from './user-domain.exception';

export class InvalidQuotaException extends UserDomainException {
  constructor() {
    super('Quota balance cannot be negative', 'INVALID_QUOTA');
  }
}
