import { configureHttpApp } from '@/common/configure-http-app';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
