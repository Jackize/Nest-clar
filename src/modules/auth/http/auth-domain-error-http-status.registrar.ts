import { DomainErrorHttpStatusRegistry } from '@/common/http/domain-error-http-status.registry';
import { AUTH_DOMAIN_ERROR_HTTP_STATUS } from '@/modules/auth/http/auth-error.http-status';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AuthDomainErrorHttpStatusRegistrar implements OnModuleInit {
  constructor(private readonly registry: DomainErrorHttpStatusRegistry) {}

  onModuleInit() {
    this.registry.register(AUTH_DOMAIN_ERROR_HTTP_STATUS);
  }
}
