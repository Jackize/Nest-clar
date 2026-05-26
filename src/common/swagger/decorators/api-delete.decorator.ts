import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import { ApiDomainErrors, type ApiDomainErrorSpec } from '@/common/swagger/api-domain-errors.util';
import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';

export function ApiDelete(domainErrors: ApiDomainErrorSpec[] | DomainErrorHttpStatusMap = []) {
  return applyDecorators(ApiNoContentResponse({ description: 'Deleted' }), ApiDomainErrors(domainErrors));
}

export function ApiDeleteOk<TSuccessDto extends Type<unknown>>(
  successDto: TSuccessDto,
  domainErrors: ApiDomainErrorSpec[] | DomainErrorHttpStatusMap = [],
) {
  return applyDecorators(
    ApiExtraModels(successDto),
    ApiOkResponse({ type: successDto, description: 'Deleted' }),
    ApiDomainErrors(domainErrors),
  );
}
