import { UserDomainException } from './user-domain.exception';

export class UserNotFoundException extends UserDomainException {
  constructor() {
    super('User not found', 'USER_NOT_FOUND');
  }
}
