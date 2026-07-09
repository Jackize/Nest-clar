import { RepositoryOptions } from '@/database/interfaces/repository-options.interface';
import { BaseRepository } from '@/database/repositories/base.repository';
import { User } from '@/modules/user/domain/entities/user.entity';
import { IUserRepository } from '@/modules/user/domain/repositories/user-repository.interface';
import { QuotaBalance } from '@/modules/user/domain/value-objects/quota-balance.vo';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class TypeormUserRepository extends BaseRepository<UserOrmEntity> implements IUserRepository {
  constructor(
    @InjectDataSource()
    dataSource: DataSource,
  ) {
    super(dataSource);
  }

  async save(user: User): Promise<User> {
    await this.withMasterRepository(UserOrmEntity, async (repo) => {
      await repo.save(this.toOrm(user));
    });
    return user;
  }

  async findByEmail(email: string, options?: RepositoryOptions): Promise<User | null> {
    const row = await this.withRepository(UserOrmEntity, options, async (repo) => {
      return await repo.findOne({
        where: { email },
      });
    });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string, options?: RepositoryOptions): Promise<User | null> {
    const row = await this.withRepository(UserOrmEntity, options, async (repo) => {
      return await repo.findOne({
        where: { id },
      });
    });
    return row ? this.toDomain(row) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.withMasterRepository(UserOrmEntity, async (repo) => {
      return await repo.softDelete({ id });
    });
    return (result.affected ?? 0) > 0;
  }

  private toDomain(row: UserOrmEntity): User {
    return User.reconstitute({
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      passwordHash: row.passwordHash ?? undefined,
      quotaRemaining: new QuotaBalance(row.quotaRemaining),
      deletedAt: row.deletedAt,
    });
  }

  private toOrm(user: User): UserOrmEntity {
    const row = new UserOrmEntity();
    row.id = user.id;
    row.email = user.email;
    row.displayName = user.displayName;
    row.avatarUrl = user.avatarUrl;
    row.passwordHash = user.passwordHash ?? null;
    row.quotaRemaining = user.quotaRemaining.amount;
    row.deletedAt = user.deletedAt;
    return row;
  }
}
