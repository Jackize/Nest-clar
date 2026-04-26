import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import {
  ApiDomainErrors,
  type ApiDomainErrorSpec,
} from '@/common/swagger/api-domain-errors.util';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels } from '@nestjs/swagger';

export function ApiCreate<TSuccessDto extends Type<unknown>>(
  successDto: TSuccessDto,
  domainErrors: ApiDomainErrorSpec[] | DomainErrorHttpStatusMap = [],
) {
  return applyDecorators(
    ApiExtraModels(successDto),
    ApiCreatedResponse({ type: successDto, description: 'Created' }),
    ApiDomainErrors(domainErrors),
  );
}
