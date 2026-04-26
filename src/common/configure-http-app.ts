import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './swagger/setup-swagger';

export function configureHttpApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  setupSwagger(app);
}
