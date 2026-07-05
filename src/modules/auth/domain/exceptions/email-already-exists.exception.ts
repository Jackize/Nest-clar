import { AuthDomainException } from './auth-domain.exception';

export class EmailAlreadyExistsException extends AuthDomainException {
  constructor() {
    super('Email already registered', 'EMAIL_ALREADY_EXISTS');
  }
}
