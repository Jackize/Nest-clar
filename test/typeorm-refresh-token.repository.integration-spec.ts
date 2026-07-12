import { AppModule } from '@/app.module';
import { configureHttpApp } from '@/common/configure-http-app';
import { RefreshTokenEntity } from '@/modules/auth/domain/entities/refresh-token.entity';
import { TypeormRefreshTokenRepository } from '@/modules/auth/infrastructure/persistence/typeorm-refresh-token.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import crypto from 'crypto';

describe('TypeormRefreshTokenRepository (integration)', () => {
  let app: INestApplication;
  let repository: TypeormRefreshTokenRepository;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttpApp(app);
    await app.init();
    repository = moduleRef.get(TypeormRefreshTokenRepository);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should save and find a refresh token as a domain entity', async () => {
    const tokenValue = `refresh-${crypto.randomUUID()}`;
    const entity = new RefreshTokenEntity(
      crypto.randomUUID(),
      tokenValue,
      crypto.randomUUID(),
      new Date(Date.now() + 60_000),
      false,
    );

    await repository.save(entity);
    const found = await repository.findByToken(tokenValue);

    expect(found).not.toBeNull();
    expect(found?.token).toBe(tokenValue);
    expect(found?.userId).toBe(entity.userId);
    expect(found).not.toHaveProperty('createdAt');
  });

  it('should revoke only tokens belonging to the target user', async () => {
    const userA = crypto.randomUUID();
    const userB = crypto.randomUUID();
    const tokenA = new RefreshTokenEntity(
      crypto.randomUUID(),
      `token-a-${crypto.randomUUID()}`,
      userA,
      new Date(Date.now() + 60_000),
      false,
    );
    const tokenB = new RefreshTokenEntity(
      crypto.randomUUID(),
      `token-b-${crypto.randomUUID()}`,
      userB,
      new Date(Date.now() + 60_000),
      false,
    );

    await repository.save(tokenA);
    await repository.save(tokenB);
    await repository.revokeAllForUser(userA);

    const foundA = await repository.findByToken(tokenA.token);
    const foundB = await repository.findByToken(tokenB.token);

    expect(foundA?.isRevoked()).toBe(true);
    expect(foundB?.isRevoked()).toBe(false);
  });
});
