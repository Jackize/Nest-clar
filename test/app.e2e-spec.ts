import { configureHttpApp } from '@/common/configure-http-app';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureHttpApp(app);
    await app.init();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe('Hello World!');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.path).toBe('/');
  });

  afterEach(async () => {
    await app.close();
  });
});
