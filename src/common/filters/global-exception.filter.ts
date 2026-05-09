import { DomainError } from '@/common/errors/domain.error';
import { DomainErrorHttpMapper } from '@/common/http/domain-error-http.mapper';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly domainErrorHttpMapper: DomainErrorHttpMapper) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof DomainError) {
      const { status, body } = this.domainErrorHttpMapper.toHttp(exception);
      this.logger.warn(`Domain error: ${JSON.stringify({ status, body })}`);
      return response.status(status).json({
        success: false,
        message: body.message,
        code: body.code,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      this.logger.error(exception);
      return response.status(status).json({
        success: false,
        code: HttpStatus[status],
        message:
          typeof payload === 'object' &&
          payload !== null &&
          'message' in payload
            ? (payload as { message: string | string[] }).message
            : exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    this.logger.error(exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
