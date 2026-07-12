import { AuthDomainException } from './auth-domain.exception';

export class TokenExpiredException extends AuthDomainException {
  constructor() {
    super('Refresh token đã hết hạn hoặc không hợp lệ', 'TOKEN_EXPIRED');
    this.name = 'TokenExpiredException';
  }
}
