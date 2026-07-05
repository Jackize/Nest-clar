import { InvalidEmailException } from '../../domain/exceptions/invalid-email.exception';
import { Email } from './email.vo';

describe('Email', () => {
  it('should accept a valid email', () => {
    const email = new Email('User@Example.com');
    expect(email.value).toBe('user@example.com');
  });

  it('should reject an invalid email', () => {
    expect(() => new Email('not-an-email')).toThrow(InvalidEmailException);
    expect(() => new Email('missing@domain')).toThrow(InvalidEmailException);
    expect(() => new Email('@nodomain.com')).toThrow(InvalidEmailException);
  });
});
