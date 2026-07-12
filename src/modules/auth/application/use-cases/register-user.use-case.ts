import { CreateUserUseCase } from '@/modules/user/application/use-cases/create-user.use-case';
import { User } from '@/modules/user/domain/entities/user.entity';
import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { UserRepositoryPort } from '../ports/user-repository.port';

export type RegisterUserInput = {
  email: string;
  password: string;
};

export type RegisterUserOutput = {
  id: string;
  email: string;
};

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = new Email(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new EmailAlreadyExistsException();
    }

    const hashed = await this.passwordHasher.hash(input.password);
    const displayName = email.value.split('@')[0];
    const user = await this.createUserUseCase.execute({
      email: email.value,
      passwordHash: hashed,
      displayName,
    });

    return { id: user.id, email: user.email };
  }
}
