import { UserDomainException } from './user-domain.exception';

export class EmailAlreadyExistsException extends UserDomainException {
  constructor() {
    super('User already exists', 'USER_ALREADY_EXISTS');
  }
}
