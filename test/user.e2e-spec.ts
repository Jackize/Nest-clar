import { AppModule } from '@/app.module';
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
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.name).toBe('test user');
    expect(typeof response.body.id).toBe('string');
    expect(response.body.id.length).toBeGreaterThan(0);
    createdUserId = response.body.id;
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
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.name).toBe('test user');
  });

  it('should return 404 if user not found', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users/1234567890`,
    );
    expect(response.status).toBe(404);
  });
});
