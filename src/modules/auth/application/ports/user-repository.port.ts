import { HashedPassword } from '../../domain/value-objects/hashed-password.vo';
import { Email } from '../../domain/value-objects/email.vo';

export type AuthUser = {
  id: string;
  email: string;
  passwordHash?: string;
};

export interface UserRepositoryPort {
  findByEmail(email: Email): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  create(email: Email, passwordHash: HashedPassword, name: string): Promise<AuthUser>;
}
