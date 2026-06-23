const DATABASE_CONNECTION_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET',
  'EHOSTUNREACH',
  '57P01', // PostgreSQL: admin shutdown
  '57P02', // PostgreSQL: crash shutdown
  '57P03', // PostgreSQL: cannot connect now
  '08000',
  '08001',
  '08003',
  '08004',
  '08006',
  '08007',
  '08P01',
]);

const DATABASE_CONNECTION_ERROR_MESSAGES = [
  'connection terminated',
  'connection timeout',
  'connection refused',
  'connect econnrefused',
  'database system is shutting down',
  'the database system is starting up',
];

export function isDatabaseConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;
  if (code && DATABASE_CONNECTION_ERROR_CODES.has(code)) {
    return true;
  }

  const message = error.message.toLowerCase();
  if (DATABASE_CONNECTION_ERROR_MESSAGES.some((candidate) => message.includes(candidate))) {
    return true;
  }

  const cause = (error as { cause?: unknown }).cause;
  return cause !== undefined && isDatabaseConnectionError(cause);
}
