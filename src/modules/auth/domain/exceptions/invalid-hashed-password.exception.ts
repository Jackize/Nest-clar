import { AuthDomainException } from './auth-domain.exception';

export class InvalidHashedPasswordException extends AuthDomainException {
  constructor() {
    super('Hashed password cannot be empty', 'INVALID_HASHED_PASSWORD');
  }
}
