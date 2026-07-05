import { AuthDomainException } from './auth-domain.exception';

export class InvalidCredentialsException extends AuthDomainException {
  constructor() {
    super('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
  }
}
