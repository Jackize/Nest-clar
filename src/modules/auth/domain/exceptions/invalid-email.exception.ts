import { AuthDomainException } from './auth-domain.exception';

export class InvalidEmailException extends AuthDomainException {
  constructor() {
    super('Invalid email format', 'INVALID_EMAIL');
  }
}
