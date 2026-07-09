import { User } from '@/modules/user/domain/entities/user.entity';

describe('User', () => {
  it('should default quotaRemaining to 10 on create', () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
    });

    expect(user.quotaRemaining.amount).toBe(10);
  });

  it('should not allow changing email via updateProfile', () => {
    const user = User.create({
      id: 'user-1',
      email: 'test@example.com',
    });

    user.updateProfile({ displayName: 'New Name', avatarUrl: 'https://example.com/avatar.png' });

    expect(user.email).toBe('test@example.com');
    expect(user.displayName).toBe('New Name');
    expect(user.avatarUrl).toBe('https://example.com/avatar.png');
  });
});
