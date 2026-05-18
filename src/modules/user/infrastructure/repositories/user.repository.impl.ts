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

  async findAll(
    page: number,
    limit: number,
    sortOrder: 'asc' | 'desc',
  ): Promise<UserEntity[]> {
    return this.users.slice((page - 1) * limit, page * limit).sort((a, b) => {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });
  }

  async update(id: string, user: UserEntity): Promise<UserEntity | null> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      return null;
    }
    const existing = this.users[index];
    existing.changeEmail(user.email);
    existing.updateName(user.name);
    this.users[index] = existing;
    return existing;
  }

  async patch(
    id: string,
    user: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return null;
    }
    const existing = this.users[index];
    if (user.email) {
      existing.changeEmail(user.email);
    }

    if (user.name) {
      existing.updateName(user.name);
    }
    this.users[index] = existing;
    return existing;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      return false;
    }
    this.users.splice(index, 1);
    return true;
  }
}
