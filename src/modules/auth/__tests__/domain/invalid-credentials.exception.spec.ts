import { InvalidCredentialsException } from '@/modules/auth/domain/exceptions/invalid-credentials.exception';

describe('InvalidCredentialsException', () => {
  it('should use a fixed generic message', () => {
    const error = new InvalidCredentialsException();

    expect(error.message).toBe('Email hoặc mật khẩu không đúng');
    expect(error.code).toBe('INVALID_CREDENTIALS');
  });
});
