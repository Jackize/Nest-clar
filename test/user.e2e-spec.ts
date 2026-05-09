import { AppModule } from '@/app.module';
import { configureHttpApp } from '@/common/configure-http-app';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

describe('User API (integration)', () => {
  let app: INestApplication<App>;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttpApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a user', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.name).toBe('test user');
    expect(typeof response.body.data.id).toBe('string');
    expect(response.body.data.id.length).toBeGreaterThan(0);
    createdUserId = response.body.data.id;
  });

  it('should return 409 if user already exists', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(response.status).toBe(409);
  });

  it('should get a user by id', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users/${createdUserId}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.name).toBe('test user');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe(`/users/${createdUserId}`);
  });

  it('should return 404 if user not found', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users/1234567890`,
    );
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('USER_NOT_FOUND');
    expect(response.body.message).toBe('User not found');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe(`/users/1234567890`);
  });
});
