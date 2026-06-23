import { HttpStatus, ServiceUnavailableException } from '@nestjs/common';

export class PrimaryDbUnavailableException extends ServiceUnavailableException {
  constructor() {
    super({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: 'Primary database unavailable',
      code: 'PRIMARY_DB_UNAVAILABLE',
      retryable: true,
    });
  }
}
