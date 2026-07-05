import { RefreshTokenEntity } from '@/modules/auth/domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';

@Injectable()
export class TypeormRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repo: Repository<RefreshTokenOrmEntity>,
  ) {}

  async save(token: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    const row = RefreshTokenOrmEntity.fromDomain(token);
    await this.repo.save(row);
    return RefreshTokenOrmEntity.toDomain(row);
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const row = await this.repo.findOne({ where: { token } });
    return row ? RefreshTokenOrmEntity.toDomain(row) : null;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update({ userId, revoked: false }, { revoked: true });
  }
}
