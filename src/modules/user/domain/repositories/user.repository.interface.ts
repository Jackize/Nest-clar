import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(
    page: number,
    limit: number,
    sortOrder: 'asc' | 'desc',
  ): Promise<UserEntity[]>;
  update(id: string, user: UserEntity): Promise<UserEntity | null>;
  patch(id: string, user: Partial<UserEntity>): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}
