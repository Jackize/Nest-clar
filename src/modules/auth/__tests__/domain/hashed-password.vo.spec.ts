import { InvalidHashedPasswordException } from '@/modules/auth/domain/exceptions/invalid-hashed-password.exception';
import { HashedPassword } from '@/modules/auth/domain/value-objects/hashed-password.vo';

describe('HashedPassword', () => {
  it('should throw when initialized with an empty string', () => {
    expect(() => new HashedPassword('')).toThrow(InvalidHashedPasswordException);
    expect(() => new HashedPassword('   ')).toThrow(InvalidHashedPasswordException);
  });

  it('should only expose the hash through toString()', () => {
    const password = new HashedPassword('$2b$12$hashedvalue');

    expect(Object.getOwnPropertyNames(Object.getPrototypeOf(password))).toEqual(['constructor', 'toString']);
    expect(password.toString()).toBe('$2b$12$hashedvalue');
    expect(password).not.toHaveProperty('hash');
  });
});
