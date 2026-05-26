import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import { ApiDomainErrors, type ApiDomainErrorSpec } from '@/common/swagger/api-domain-errors.util';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse } from '@nestjs/swagger';

export function ApiGet<TSuccessDto extends Type<unknown>>(
  successDto: TSuccessDto,
  domainErrors: ApiDomainErrorSpec[] | DomainErrorHttpStatusMap = [],
) {
  return applyDecorators(
    ApiExtraModels(successDto),
    ApiOkResponse({ type: successDto, description: 'OK' }),
    ApiDomainErrors(domainErrors),
  );
}
