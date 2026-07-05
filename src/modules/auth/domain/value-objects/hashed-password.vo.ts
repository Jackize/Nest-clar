export class HashedPassword {
  private readonly _hash: string;

  constructor(hash: string) {
    if (!hash || hash.trim().length === 0) {
      throw new Error('Hashed password cannot be empty');
    }
    this._hash = hash;
  }

  get hash(): string {
    return this._hash;
  }
}
