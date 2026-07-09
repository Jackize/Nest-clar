import { QuotaBalance } from '../value-objects/quota-balance.vo';

export type UserProps = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  passwordHash?: string;
  quotaRemaining?: QuotaBalance;
  deletedAt?: Date | null;
};

export class User {
  private constructor(
    public readonly id: string,
    private _email: string,
    private _displayName: string,
    private _avatarUrl: string | null,
    private _passwordHash: string | undefined,
    private _quotaRemaining: QuotaBalance,
    private _deletedAt: Date | null,
  ) {}

  static create(props: { id: string; email: string; passwordHash?: string; displayName?: string }): User {
    const displayName = props.displayName ?? props.email.split('@')[0];
    return new User(
      props.id,
      props.email.trim().toLowerCase(),
      displayName,
      null,
      props.passwordHash,
      new QuotaBalance(10),
      null,
    );
  }

  static reconstitute(props: UserProps): User {
    return new User(
      props.id,
      props.email,
      props.displayName,
      props.avatarUrl ?? null,
      props.passwordHash,
      props.quotaRemaining ?? new QuotaBalance(10),
      props.deletedAt ?? null,
    );
  }

  get email(): string {
    return this._email;
  }

  get displayName(): string {
    return this._displayName;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get passwordHash(): string | undefined {
    return this._passwordHash;
  }

  get quotaRemaining(): QuotaBalance {
    return this._quotaRemaining;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  updateProfile(props: { displayName?: string; avatarUrl?: string | null }): void {
    if (props.displayName !== undefined) {
      this._displayName = props.displayName;
    }
    if (props.avatarUrl !== undefined) {
      this._avatarUrl = props.avatarUrl;
    }
  }

  deductQuota(): void {
    this._quotaRemaining = this._quotaRemaining.decrement();
  }

  refundQuota(amount = 1): void {
    this._quotaRemaining = this._quotaRemaining.increment(amount);
  }

  markDeleted(deletedAt: Date): void {
    this._deletedAt = deletedAt;
  }
}
