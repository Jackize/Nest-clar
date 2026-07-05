import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import { HttpStatus } from '@nestjs/common';

export const AUTH_DOMAIN_ERROR_HTTP_STATUS: DomainErrorHttpStatusMap = {
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  TOKEN_EXPIRED: HttpStatus.UNAUTHORIZED,
  EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
  INVALID_EMAIL: HttpStatus.BAD_REQUEST,
};
