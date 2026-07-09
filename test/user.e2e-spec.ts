import { AppModule } from '@/app.module';
import { configureHttpApp } from '@/common/configure-http-app';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

describe('User API (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let accessToken: string;
  let otherUserToken: string;

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

  it('POST /auth/register creates a user with default quota', async () => {
    const email = `user-${Date.now()}@example.com`;
    const response = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });

    expect(response.status).toBe(201);
    userId = response.body.data.id;
    expect(response.body.data.email).toBe(email);
  });

  it('POST /auth/login returns access token', async () => {
    const email = `user-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });

    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);
    accessToken = loginResponse.body.data.accessToken;
    userId = loginResponse.body.data.userId ?? userId;
  });

  it('GET /users/me returns the authenticated user without passwordHash', async () => {
    const email = `me-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });
    const token = loginResponse.body.data.accessToken;
    const id = registerResponse.body.data.id;

    const response = await request(app.getHttpServer()).get('/users/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(id);
    expect(response.body.data.quotaRemaining).toBe(10);
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('GET /users/:id returns 200 for owner and excludes passwordHash', async () => {
    const email = `owner-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });
    const token = loginResponse.body.data.accessToken;
    const id = registerResponse.body.data.id;

    const response = await request(app.getHttpServer()).get(`/users/${id}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(id);
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('GET /users/:id returns 403 for a different user', async () => {
    const ownerEmail = `owner403-${Date.now()}@example.com`;
    const otherEmail = `other403-${Date.now()}@example.com`;

    const ownerRegister = await request(app.getHttpServer()).post('/auth/register').send({
      email: ownerEmail,
      password: 'password123',
    });
    await request(app.getHttpServer()).post('/auth/register').send({
      email: otherEmail,
      password: 'password123',
    });

    const otherLogin = await request(app.getHttpServer()).post('/auth/login').send({
      email: otherEmail,
      password: 'password123',
    });
    otherUserToken = otherLogin.body.data.accessToken;

    const response = await request(app.getHttpServer())
      .get(`/users/${ownerRegister.body.data.id}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(response.status).toBe(403);
  });

  it('PATCH /users/:id updates displayName and avatarUrl for owner', async () => {
    const email = `patch-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });
    const token = loginResponse.body.data.accessToken;
    const id = registerResponse.body.data.id;

    const response = await request(app.getHttpServer())
      .patch(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        displayName: 'Updated Name',
        avatarUrl: 'https://example.com/avatar.png',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.displayName).toBe('Updated Name');
    expect(response.body.data.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('PATCH /users/:id rejects unknown fields', async () => {
    const email = `patch-reject-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });
    const token = loginResponse.body.data.accessToken;
    const id = registerResponse.body.data.id;

    const response = await request(app.getHttpServer())
      .patch(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        quotaRemaining: 999,
        passwordHash: 'malicious',
      });

    expect(response.status).toBe(400);
  });

  it('PATCH /users/:id returns 403 for a different user', async () => {
    const ownerEmail = `patch-owner-${Date.now()}@example.com`;
    const otherEmail = `patch-other-${Date.now()}@example.com`;

    const ownerRegister = await request(app.getHttpServer()).post('/auth/register').send({
      email: ownerEmail,
      password: 'password123',
    });
    await request(app.getHttpServer()).post('/auth/register').send({
      email: otherEmail,
      password: 'password123',
    });
    const otherLogin = await request(app.getHttpServer()).post('/auth/login').send({
      email: otherEmail,
      password: 'password123',
    });

    const response = await request(app.getHttpServer())
      .patch(`/users/${ownerRegister.body.data.id}`)
      .set('Authorization', `Bearer ${otherLogin.body.data.accessToken}`)
      .send({ displayName: 'Hacker' });

    expect(response.status).toBe(403);
  });

  it('DELETE /users/:id returns 403 for a different user', async () => {
    const ownerEmail = `delete-owner-${Date.now()}@example.com`;
    const otherEmail = `delete-other-${Date.now()}@example.com`;

    const ownerRegister = await request(app.getHttpServer()).post('/auth/register').send({
      email: ownerEmail,
      password: 'password123',
    });
    await request(app.getHttpServer()).post('/auth/register').send({
      email: otherEmail,
      password: 'password123',
    });
    const otherLogin = await request(app.getHttpServer()).post('/auth/login').send({
      email: otherEmail,
      password: 'password123',
    });

    const response = await request(app.getHttpServer())
      .delete(`/users/${ownerRegister.body.data.id}`)
      .set('Authorization', `Bearer ${otherLogin.body.data.accessToken}`);

    expect(response.status).toBe(403);
  });

  it('DELETE /users/:id allows owner to delete account', async () => {
    const email = `delete-self-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password: 'password123',
    });
    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password: 'password123',
    });
    const token = loginResponse.body.data.accessToken;
    const id = registerResponse.body.data.id;

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);

    const refreshResponse = await request(app.getHttpServer()).post('/auth/refresh').send({
      refreshToken: loginResponse.body.data.refreshToken,
    });
    expect(refreshResponse.status).toBe(401);
  });
});
