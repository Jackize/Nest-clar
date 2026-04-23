import { DomainError } from '@/common/errors/domain.error';
import {
  mergeDomainErrorHttpStatusMaps,
  type DomainErrorHttpStatusMap,
} from '@/common/http/domain-error-http-status.types';
import {
  POST_USER_DOMAIN_ERROR_HTTP_STATUS,
  USER_DOMAIN_ERROR_HTTP_STATUS,
} from '@/modules/user/http/user-error.http-status';
import { HttpStatus } from '@nestjs/common';

const DOMAIN_ERROR_HTTP_STATUS: DomainErrorHttpStatusMap =
  mergeDomainErrorHttpStatusMaps(
    USER_DOMAIN_ERROR_HTTP_STATUS,
    POST_USER_DOMAIN_ERROR_HTTP_STATUS,
  );

export type DomainErrorHttpResponse = {
  status: HttpStatus;
  body: {
    message: string;
    code: string;
  };
};

export function getDomainErrorHttpStatus(code: string): HttpStatus | undefined {
  return DOMAIN_ERROR_HTTP_STATUS[code];
}

export function mapDomainErrorToHttp(
  error: DomainError,
): DomainErrorHttpResponse {
  const status = DOMAIN_ERROR_HTTP_STATUS[error.code] ?? HttpStatus.BAD_REQUEST;

  return {
    status,
    body: {
      message: error.message,
      code: error.code,
    },
  };
}
