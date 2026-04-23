import type { DomainErrorHttpStatusMap } from '@/common/http/domain-error-http-status.types';
import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class DomainErrorHttpStatusRegistry {
  private readonly merged: DomainErrorHttpStatusMap = {};

  register(map: DomainErrorHttpStatusMap): void {
    for (const [code, status] of Object.entries(map)) {
      if (this.merged[code] && this.merged[code] !== status) {
        throw new Error(
          `Conflict detected: Error code "${code}" is already registered with a different status.`,
        );
      }
      this.merged[code] = status;
    }
  }

  getStatus(code: string): HttpStatus | undefined {
    return this.merged[code];
  }
}
