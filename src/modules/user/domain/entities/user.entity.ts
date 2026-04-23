export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
  ) {}

  changeEmail(newEmail: string): void {
    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email');
    }
    this.email = newEmail;
  }

  updateName(name: string) {
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    this.name = name;
  }
}
