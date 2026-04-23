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

    if (exception instanceof DomainError) {
      const { status, body } = this.domainErrorHttpMapper.toHttp(exception);
      this.logger.error(`Domain error: ${JSON.stringify({ status, body })}`);
      return response.status(status).send(body);
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      this.logger.error(
        `Http exception: ${JSON.stringify({ status, payload })}`,
      );
      return response.status(status).send(payload);
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
