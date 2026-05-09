import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();

    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const method = request.method;
    const url = request.originalUrl || request.url;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    const startedAt = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        const statusCode = response.statusCode;

        this.logger.log(
          `Completed Request: ${method} ${url} ${statusCode} - ${duration}ms - ${userAgent}`,
        );
      }),
    );
  }
}
