import { ReadConsistency } from '@/database/enums/read-consistency.enum';
import { EmailAlreadyExistsException } from '@/modules/user/domain/exceptions/email-already-exists.exception';
import { User } from '@/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@/modules/user/domain/repositories/user-repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';
import crypto from 'crypto';

export type CreateUserInput = {
  email: string;
  passwordHash?: string;
  displayName?: string;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email.trim(), {
      consistency: ReadConsistency.STRONG,
    });
    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const user = User.create({
      id: crypto.randomUUID(),
      email: input.email,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
    });

    return await this.userRepository.save(user);
  }
}
