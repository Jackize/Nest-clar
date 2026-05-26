import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import { ApiErrorResponseDto } from '@/common/swagger/dto/api-error-response.dto';
import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export type ApiDomainErrorSpec =
  | string
  | {
      code: string;
      status?: HttpStatus;
      message?: string;
      description?: string;
    };

export function normalizeDomainErrors(domainErrors: ApiDomainErrorSpec[] | DomainErrorHttpStatusMap) {
  return Array.isArray(domainErrors)
    ? domainErrors.map((spec) => (typeof spec === 'string' ? { code: spec } : spec))
    : Object.entries(domainErrors).map(([code, status]) => ({ code, status }));
}

function groupByStatus(
  errors: Array<{
    code: string;
    status?: HttpStatus;
    message?: string;
    description?: string;
  }>,
) {
  const byStatus = new Map<HttpStatus, typeof errors>();
  for (const err of errors) {
    const status = err.status ?? HttpStatus.BAD_REQUEST;
    const list = byStatus.get(status) ?? [];
    list.push(err);
    byStatus.set(status, list);
  }
  return byStatus;
}

function defaultMessageFromCode(code: string) {
  return code.split('_').join(' ').toLocaleLowerCase();
}

export function ApiDomainErrors(domainErrors: ApiDomainErrorSpec[] | DomainErrorHttpStatusMap = []) {
  const normalized = normalizeDomainErrors(domainErrors);
  const grouped = groupByStatus(normalized);

  const errorResponses = Array.from(grouped.entries()).map(([status, errs]) => {
    const examples = Object.fromEntries(
      errs.map((e) => [
        e.code,
        {
          summary: e.code,
          description: e.description,
          value: {
            success: false,
            code: e.code,
            message: e.message ?? defaultMessageFromCode(e.code),
            timestamp: new Date().toISOString(),
            path: '/',
          },
        },
      ]),
    );

    return ApiResponse({
      status,
      description: errs.length === 1 ? `Error: ${errs[0]!.code}` : `Errors: ${errs.map((e) => e.code).join(', ')}`,
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ApiErrorResponseDto) },
          examples,
        },
      },
    });
  });

  return applyDecorators(ApiExtraModels(ApiErrorResponseDto), ...errorResponses);
}

export type ApiSuccessDto = Type<unknown>;
