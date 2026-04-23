import { DomainError } from '@/modules/user/domain/errors/domain.error';
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
      return response.status(exception.statusCode).send({
        message: exception.message,
        statusCode: exception.statusCode,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
