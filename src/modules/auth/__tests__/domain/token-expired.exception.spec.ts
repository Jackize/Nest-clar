import { AuthDomainException } from '@/modules/auth/domain/exceptions/auth-domain.exception';
import { TokenExpiredException } from '@/modules/auth/domain/exceptions/token-expired.exception';

describe('TokenExpiredException', () => {
  it('should extend AuthDomainException with a distinct name', () => {
    const error = new TokenExpiredException();

    expect(error).toBeInstanceOf(AuthDomainException);
    expect(error.name).toBe('TokenExpiredException');
    expect(error.code).toBe('TOKEN_EXPIRED');
  });
});
