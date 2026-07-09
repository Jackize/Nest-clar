export interface RefreshTokenRepositoryPort {
  revokeAllForUser(userId: string): Promise<void>;
}
