import { RefreshTokenEntity } from '@/modules/auth/domain/entities/refresh-token.entity';
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar' })
  token: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  static toDomain(row: RefreshTokenOrmEntity): RefreshTokenEntity {
    return new RefreshTokenEntity(row.id, row.token, row.userId, row.expiresAt, row.revoked);
  }

  static fromDomain(entity: RefreshTokenEntity): RefreshTokenOrmEntity {
    const row = new RefreshTokenOrmEntity();
    row.id = entity.id;
    row.token = entity.token;
    row.userId = entity.userId;
    row.expiresAt = entity.expiresAt;
    row.revoked = entity.isRevoked();
    return row;
  }
}
