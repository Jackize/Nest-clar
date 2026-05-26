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
    const response = await request(app.getHttpServer()).get(`/users/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.name).toBe('test user');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe(`/users/${createdUserId}`);
  });

  it('should get all users', async () => {
    const response = await request(app.getHttpServer()).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].email).toBe('test@example.com');
    expect(response.body.data[0].name).toBe('test user');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe('/users');
  });

  it('should update a user', async () => {
    const response = await request(app.getHttpServer()).put(`/users/${createdUserId}`).send({
      email: 'test2@example.com',
      name: 'Test User 2',
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test2@example.com');
    expect(response.body.data.name).toBe('test user 2');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe(`/users/${createdUserId}`);
  });

  it('should patch a user', async () => {
    const response = await request(app.getHttpServer()).patch(`/users/${createdUserId}`).send({
      email: 'test3@example.com',
      name: 'Test User 3',
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test3@example.com');
    expect(response.body.data.name).toBe('Test User 3');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe(`/users/${createdUserId}`);
  });

  it('should delete a user', async () => {
    const response = await request(app.getHttpServer()).delete(`/users/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe(`/users/${createdUserId}`);
  });

  it('should return 404 if user not found when getting a user by id', async () => {
    const response = await request(app.getHttpServer()).get(`/users/1234567890`);
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('USER_NOT_FOUND');
    expect(response.body.message).toBe('User not found');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe(`/users/1234567890`);
  });

  it('should return 404 if no users found when updating a user', async () => {
    const response = await request(app.getHttpServer()).put('/users/1234567890').send({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('USER_NOT_FOUND');
    expect(response.body.message).toBe('User not found');
  });

  it('should return 404 if no users found when deleting a user', async () => {
    const response = await request(app.getHttpServer()).delete('/users/1234567890');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('USER_NOT_FOUND');
    expect(response.body.message).toBe('User not found');
  });

  it('should return 404 if no users found when patching a user', async () => {
    const response = await request(app.getHttpServer()).patch('/users/1234567890').send({
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
