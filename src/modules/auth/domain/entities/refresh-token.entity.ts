export class RefreshTokenEntity {
  constructor(
    public readonly id: string,
    public readonly token: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    private _revoked: boolean,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this._revoked;
  }

  revoke(): void {
    this._revoked = true;
  }
}
