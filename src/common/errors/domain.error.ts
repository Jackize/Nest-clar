export class DomainError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}
