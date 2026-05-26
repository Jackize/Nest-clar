import { Global, Module } from '@nestjs/common';
import { DomainErrorHttpMapper } from '@/common/http/domain-error-http.mapper';
import { DomainErrorHttpStatusRegistry } from '@/common/http/domain-error-http-status.registry';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';

@Global()
@Module({
  providers: [DomainErrorHttpStatusRegistry, DomainErrorHttpMapper, GlobalExceptionFilter],
  exports: [DomainErrorHttpStatusRegistry, DomainErrorHttpMapper, GlobalExceptionFilter],
})
export class CommonHttpModule {}
