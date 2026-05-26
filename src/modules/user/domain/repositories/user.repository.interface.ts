import { RepositoryOptions } from '@/database/interfaces/repository-options.interface';
import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string, options?: RepositoryOptions): Promise<UserEntity | null>;
  findById(id: string, options?: RepositoryOptions): Promise<UserEntity | null>;
  findAll(page: number, limit: number, sortOrder: 'asc' | 'desc', options?: RepositoryOptions): Promise<UserEntity[]>;
  update(id: string, user: UserEntity): Promise<UserEntity | null>;
  patch(id: string, user: Partial<UserEntity>): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}
