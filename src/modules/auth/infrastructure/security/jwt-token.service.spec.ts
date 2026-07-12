import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  const payload = { sub: 'user-1', email: 'test@example.com' };

  beforeEach(() => {
    const configService = {
      getOrThrow: (key: string) => {
        if (key === 'JWT_SECRET') return 'access-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        throw new Error(`Missing config ${key}`);
      },
    } as ConfigService;

    service = new JwtTokenService(new JwtService({}), configService);
  });

  it('should roundtrip access token payload', () => {
    const token = service.signAccessToken(payload);

    expect(service.verifyAccessToken(token)).toMatchObject(payload);
  });

  it('should reject access token verified with refresh secret', () => {
    const token = service.signAccessToken(payload);

    expect(() => service.verifyRefreshToken(token)).toThrow();
  });

  it('should roundtrip refresh token payload with a different secret', () => {
    const token = service.signRefreshToken(payload);

    expect(service.verifyRefreshToken(token)).toMatchObject(payload);
    expect(() => service.verifyAccessToken(token)).toThrow();
  });
});
