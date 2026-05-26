const REPLICA_CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET',
  'EHOSTUNREACH',
]);

export function isReplicaConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;
  if (code && REPLICA_CONNECTION_ERROR_CODES.has(code)) {
    return true;
  }

  const cause = (error as { cause?: unknown }).cause;
  return cause !== undefined && isReplicaConnectionError(cause);
}
