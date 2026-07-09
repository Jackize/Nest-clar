import { RepositoryOptions } from '@/database/interfaces/repository-options.interface';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: string, options?: RepositoryOptions): Promise<User | null>;
  findById(id: string, options?: RepositoryOptions): Promise<User | null>;
  softDelete(id: string): Promise<boolean>;
}
