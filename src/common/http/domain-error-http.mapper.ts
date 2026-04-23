import { DomainError } from '@/common/errors/domain.error';
import { DomainErrorHttpStatusRegistry } from '@/common/http/domain-error-http-status.registry';
import { HttpStatus, Injectable } from '@nestjs/common';

export type DomainErrorHttpResponse = {
  status: HttpStatus;
  body: {
    message: string;
    code: string;
  };
};

@Injectable()
export class DomainErrorHttpMapper {
  constructor(private readonly registry: DomainErrorHttpStatusRegistry) {}

  toHttp(error: DomainError): DomainErrorHttpResponse {
    const status = this.registry.getStatus(error.code) ?? HttpStatus.BAD_REQUEST;
    return {
      status,
      body: {
        message: error.message,
        code: error.code,
      },
    };
  }
}

