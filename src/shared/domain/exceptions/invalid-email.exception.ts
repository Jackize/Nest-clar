import { DomainError } from '@/common/errors/domain.error';

export class InvalidEmailException extends DomainError {
  constructor() {
    super('Invalid email format', 'INVALID_EMAIL');
  }
}
