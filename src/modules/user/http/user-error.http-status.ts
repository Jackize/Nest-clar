import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import { HttpStatus } from '@nestjs/common';

export const USER_DOMAIN_ERROR_HTTP_STATUS: DomainErrorHttpStatusMap = {
  USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  USER_ALREADY_EXISTS: HttpStatus.CONFLICT,
  INVALID_EMAIL: HttpStatus.BAD_REQUEST,
  NAME_TOO_SHORT: HttpStatus.BAD_REQUEST,
};

export const POST_USER_DOMAIN_ERROR_HTTP_STATUS: DomainErrorHttpStatusMap = {
  USER_ALREADY_EXISTS: HttpStatus.CONFLICT,
};
