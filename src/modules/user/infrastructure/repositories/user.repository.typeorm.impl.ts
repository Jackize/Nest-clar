import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from '../persistence/user.orm-entity';

@Injectable()
export class UserRepositoryTypeORMImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async save(user: UserEntity): Promise<UserEntity> {
    await this.repo.insert({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'name'],
    });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.repo.findOne({
      where: { id },
      select: ['id', 'email', 'name'],
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(
    page: number,
    limit: number,
    sortOrder: 'asc' | 'desc',
  ): Promise<UserEntity[]> {
    const rows = await this.repo.find({
      order: { name: sortOrder === 'asc' ? 'ASC' : 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'email', 'name'],
    });
    return rows.map((row) => this.toDomain(row));
  }

  async update(id: string, user: UserEntity): Promise<UserEntity | null> {
    const row = await this.repo.findOne({
      where: { id },
      select: ['id', 'email', 'name'],
    });
    if (!row) {
      return null;
    }
    row.email = user.email;
    row.name = user.name;
    await this.repo.save(row);
    return this.toDomain(row);
  }

  async patch(
    id: string,
    user: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const row = await this.repo.findOne({
      where: { id },
      select: ['id', 'email', 'name'],
    });
    if (!row) {
      return null;
    }
    if (user.email !== undefined) {
      row.email = user.email;
    }
    if (user.name !== undefined) {
      row.name = user.name;
    }
    await this.repo.save(row);
    return this.toDomain(row);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  private toDomain(row: UserOrmEntity): UserEntity {
    return new UserEntity(row.id, row.email, row.name);
  }
}
