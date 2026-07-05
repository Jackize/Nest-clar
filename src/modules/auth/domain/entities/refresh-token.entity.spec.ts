import { RefreshTokenEntity } from './refresh-token.entity';

describe('RefreshTokenEntity', () => {
  const createToken = (expiresAt: Date, revoked = false) =>
    new RefreshTokenEntity('id-1', 'token-1', 'user-1', expiresAt, revoked);

  it('should return true when token is expired', () => {
    const past = new Date(Date.now() - 1000);
    expect(createToken(past).isExpired()).toBe(true);
  });

  it('should return false when token is not expired', () => {
    const future = new Date(Date.now() + 60_000);
    expect(createToken(future).isExpired()).toBe(false);
  });

  it('should revoke token', () => {
    const future = new Date(Date.now() + 60_000);
    const token = createToken(future);
    expect(token.isRevoked()).toBe(false);
    token.revoke();
    expect(token.isRevoked()).toBe(true);
  });
});
