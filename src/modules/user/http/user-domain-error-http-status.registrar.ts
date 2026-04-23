import { DomainErrorHttpStatusRegistry } from '@/common/http/domain-error-http-status.registry';
import {
  POST_USER_DOMAIN_ERROR_HTTP_STATUS,
  USER_DOMAIN_ERROR_HTTP_STATUS,
} from '@/modules/user/http/user-error.http-status';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UserDomainErrorHttpStatusRegistrar implements OnModuleInit {
  constructor(private readonly registry: DomainErrorHttpStatusRegistry) {}

  onModuleInit() {
    this.registry.register(USER_DOMAIN_ERROR_HTTP_STATUS);
    this.registry.register(POST_USER_DOMAIN_ERROR_HTTP_STATUS);
  }
}

