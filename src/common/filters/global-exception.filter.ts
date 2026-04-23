import { DomainError } from '@/common/errors/domain.error';
import { mapDomainErrorToHttp } from '@/common/http/domain-error.http-map';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof DomainError) {
      const { status, body } = mapDomainErrorToHttp(exception);
      return response.status(status).send(body);
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
