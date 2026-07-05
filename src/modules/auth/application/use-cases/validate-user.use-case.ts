import { UserRepositoryPort } from '../ports/user-repository.port';

export class ValidateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }
    return { id: user.id, email: user.email };
  }
}
