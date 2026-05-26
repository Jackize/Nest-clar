import { DomainError } from '@/common/errors/domain.error';
import { ReadConsistency } from '@/database/enums/read-consistency.enum';
import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';
import crypto from 'crypto';

type CreateUserInput = {
  email: string;
  name: string;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(input.email.trim(), {
      consistency: ReadConsistency.STRONG,
    });
    if (existingUser) {
      throw new DomainError('User already exists', 'USER_ALREADY_EXISTS');
    }
    const user = new UserEntity(crypto.randomUUID(), input.email.trim(), input.name.trim().toLowerCase());
    return await this.userRepository.save(user);
  }
}
