import { BcryptPasswordHasherService } from './bcrypt-password-hasher.service';

describe('BcryptPasswordHasherService', () => {
  const hasher = new BcryptPasswordHasherService();

  it('should hash and compare the same password successfully', async () => {
    const hashed = await hasher.hash('secret-password');

    expect(await hasher.compare('secret-password', hashed)).toBe(true);
  });

  it('should return false when comparing the wrong password', async () => {
    const hashed = await hasher.hash('secret-password');

    expect(await hasher.compare('wrong-password', hashed)).toBe(false);
  });
});
