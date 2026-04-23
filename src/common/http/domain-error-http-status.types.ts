import { HttpStatus } from '@nestjs/common';

export type DomainErrorHttpStatusMap = Record<string, HttpStatus>;

export function mergeDomainErrorHttpStatusMaps(
  ...maps: DomainErrorHttpStatusMap[]
): DomainErrorHttpStatusMap {
  return Object.assign({}, ...maps);
}
