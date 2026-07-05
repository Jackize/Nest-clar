import { DomainError } from '@/common/errors/domain.error';

export class UserEntity {
  constructor(
    public readonly id: string,
    private _email: string,
    private _name: string,
    private _passwordHash?: string,
  ) {
    this.validateEmail(_email);
    this.validateName(_name);
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get passwordHash(): string | undefined {
    return this._passwordHash;
  }

  setPasswordHash(hash: string): void {
    this._passwordHash = hash;
  }

  changeEmail(newEmail: string): void {
    this.validateEmail(newEmail);
    this._email = newEmail;
  }

  updateName(name: string) {
    this.validateName(name);
    this._name = name;
  }

  private validateEmail(email: string): void {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new DomainError('Invalid email', 'INVALID_EMAIL');
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new DomainError('Name must be at least 2 characters long', 'NAME_TOO_SHORT');
    }
  }
}
