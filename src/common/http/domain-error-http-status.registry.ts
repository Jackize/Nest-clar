import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class DomainErrorHttpStatusRegistry {
  private readonly merged: DomainErrorHttpStatusMap = {};

  register(map: DomainErrorHttpStatusMap): void {
    Object.assign(this.merged, map);
  }

  getStatus(code: string): HttpStatus | undefined {
    return this.merged[code];
  }
}

