import { isDatabaseConnectionError } from './database-connection-error';

export function isReplicaConnectionError(error: unknown): boolean {
  return isDatabaseConnectionError(error);
}
