export class UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  quotaRemaining: number;

  static fromUser(user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    quotaRemaining: { amount: number };
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      quotaRemaining: user.quotaRemaining.amount,
    };
  }
}
