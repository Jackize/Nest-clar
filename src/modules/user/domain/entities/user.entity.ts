import { DomainError } from '@/common/errors/domain.error';

export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
  ) {}

  changeEmail(newEmail: string): void {
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new DomainError('Invalid email', 'INVALID_EMAIL');
    }
    this.email = newEmail;
  }

  updateName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new DomainError(
        'Name must be at least 2 characters long',
        'NAME_TOO_SHORT',
      );
    }
    this.name = name;
  }
}
