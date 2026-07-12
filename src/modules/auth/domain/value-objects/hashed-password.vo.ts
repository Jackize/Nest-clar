import { InvalidHashedPasswordException } from '../exceptions/invalid-hashed-password.exception';

export class HashedPassword {
  private readonly value: string;

  constructor(hash: string) {
    if (!hash || hash.trim().length === 0) {
      throw new InvalidHashedPasswordException();
    }
    this.value = hash;
  }

  toString(): string {
    return this.value;
  }
}
