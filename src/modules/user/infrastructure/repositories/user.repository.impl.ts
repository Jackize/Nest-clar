import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/modules/user/domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  private users: UserEntity[] = [];

  async save(user: UserEntity): Promise<UserEntity> {
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}
