import { AppModule } from '@/app.module';
import { configureHttpApp } from '@/common/configure-http-app';
import { User } from '@/modules/user/domain/entities/user.entity';
import { TypeormUserRepository } from '@/modules/user/infrastructure/persistence/typeorm-user.repository';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import crypto from 'crypto';

describe('TypeormUserRepository (integration)', () => {
  let app: INestApplication;
  let repository: TypeormUserRepository;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttpApp(app);
    await app.init();
    repository = moduleRef.get(TypeormUserRepository);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should persist and load a user by id', async () => {
    const user = User.create({
      id: crypto.randomUUID(),
      email: `repo-test-${Date.now()}@example.com`,
      passwordHash: 'hashed-password',
    });

    await repository.save(user);
    const found = await repository.findById(user.id);

    expect(found).not.toBeNull();
    expect(found?.email).toBe(user.email);
    expect(found?.quotaRemaining.amount).toBe(10);
  });

  it('should return null when email does not exist', async () => {
    const found = await repository.findByEmail(`missing-${Date.now()}@example.com`);
    expect(found).toBeNull();
  });
});
