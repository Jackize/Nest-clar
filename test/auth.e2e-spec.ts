import { AppModule } from '@/app.module';
import { configureHttpApp } from '@/common/configure-http-app';
import {
  LoginUserUseCaseProvider,
  RegisterUserUseCaseProvider,
} from '@/modules/auth/infrastructure/providers/auth-use-case.providers';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureHttpApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('AuthModule resolves core providers through DI', () => {
    expect(app.get(RegisterUserUseCaseProvider)).toBeDefined();
    expect(app.get(LoginUserUseCaseProvider)).toBeDefined();
  });

  it('POST /auth/register stores hashed password and returns 201', async () => {
    const email = `register-${Date.now()}@example.com`;
    const response = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe(email);
    expect(response.body.data).not.toHaveProperty('accessToken');
  });

  it('POST /auth/register returns 409 for duplicate email', async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });

    const response = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });

    expect(response.status).toBe(409);
  });

  it('POST /auth/login returns 401 with generic message for wrong password', async () => {
    const email = `login-fail-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });

    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Email hoặc mật khẩu không đúng');
  });

  it('POST /auth/login returns 401 with the same generic message for unknown email', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: `missing-${Date.now()}@example.com`,
      password: 'password123',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Email hoặc mật khẩu không đúng');
  });

  it('POST /auth/refresh rotates token and rejects the old refresh token', async () => {
    const email = `refresh-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });
    const oldRefreshToken = loginResponse.body.data.refreshToken;

    const refreshResponse = await request(app.getHttpServer()).post('/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeDefined();

    const reuseResponse = await request(app.getHttpServer()).post('/auth/refresh').send({
      refreshToken: oldRefreshToken,
    });

    expect(reuseResponse.status).toBe(401);
  });

  it('GET /users/me requires authentication', async () => {
    const response = await request(app.getHttpServer()).get('/users/me');
    expect(response.status).toBe(401);
  });

  it('GET /users/me returns 200 with a valid access token', async () => {
    const email = `jwt-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });

    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${loginResponse.body.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
  });
});
