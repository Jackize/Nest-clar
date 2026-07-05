import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  save(token: RefreshTokenEntity): Promise<RefreshTokenEntity>;
  findByToken(token: string): Promise<RefreshTokenEntity | null>;
  revokeAllForUser(userId: string): Promise<void>;
}
