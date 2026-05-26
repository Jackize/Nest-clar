import { ReplicaCircuitBreakerService } from '@/database/circuit-breaker/replica-circuit-breaker.service';
import { RepositoryOptions } from '@/database/interfaces/repository-options.interface';
import { BaseRepository } from '@/database/repositories/base.repository';
import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserOrmEntity } from '../persistence/user.orm-entity';

@Injectable()
export class UserRepositoryTypeORMReplicaImpl extends BaseRepository<UserOrmEntity> implements IUserRepository {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,
    circuitBreaker: ReplicaCircuitBreakerService,
  ) {
    super(dataSource, circuitBreaker);
  }

  async save(user: UserEntity): Promise<UserEntity> {
    await this.withMasterRepository(UserOrmEntity, async (repo) => {
      await repo.save({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    });
    return user;
  }

  async findByEmail(email: string, options?: RepositoryOptions): Promise<UserEntity | null> {
    const row = await this.withRepository(UserOrmEntity, options, async (repo) => {
      return await repo.findOne({
        where: { email },
        select: ['id', 'email', 'name'],
      });
    });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string, options?: RepositoryOptions): Promise<UserEntity | null> {
    const row = await this.withRepository(UserOrmEntity, options, async (repo) => {
      return await repo.findOne({
        where: { id },
        select: ['id', 'email', 'name'],
      });
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(
    page: number,
    limit: number,
    sortOrder: 'asc' | 'desc',
    options?: RepositoryOptions,
  ): Promise<UserEntity[]> {
    const rows = await this.withRepository(UserOrmEntity, options, async (repo) => {
      return await repo.find({
        order: { name: sortOrder === 'asc' ? 'ASC' : 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        select: ['id', 'email', 'name'],
      });
    });
    return rows.map((row) => this.toDomain(row));
  }

  async update(id: string, user: UserEntity): Promise<UserEntity | null> {
    return await this.withMasterRepository(UserOrmEntity, async (repo) => {
      const row = await repo.findOne({
        where: { id },
        select: ['id', 'email', 'name'],
      });
      if (!row) {
        return null;
      }
      row.email = user.email;
      row.name = user.name;
      await repo.save(row);
      return this.toDomain(row);
    });
  }

  async patch(id: string, user: Partial<UserEntity>): Promise<UserEntity | null> {
    return await this.withMasterRepository(UserOrmEntity, async (repo) => {
      const row = await repo.findOne({
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
      await repo.save(row);
      return this.toDomain(row);
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.withMasterRepository(UserOrmEntity, async (repo) => {
      return await repo.delete({ id });
    });
    return (result.affected ?? 0) > 0;
  }

  private toDomain(row: UserOrmEntity): UserEntity {
    return new UserEntity(row.id, row.email, row.name);
  }
}
