import { UserRepositoryPort } from '@/modules/auth/application/ports/user-repository.port';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';
import { HashedPassword } from '@/modules/auth/domain/value-objects/hashed-password.vo';
import { ReadConsistency } from '@/database/enums/read-consistency.enum';
import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class UserRepositoryAuthAdapter implements UserRepositoryPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async findByEmail(email: Email) {
    const user = await this.userRepository.findByEmail(email.value, {
      consistency: ReadConsistency.STRONG,
    });
    if (!user) {
      return null;
    }
    return this.toAuthUser(user);
  }

  async findById(id: string) {
    const user = await this.userRepository.findById(id, {
      consistency: ReadConsistency.STRONG,
    });
    if (!user) {
      return null;
    }
    return this.toAuthUser(user);
  }

  async create(email: Email, passwordHash: HashedPassword, name: string) {
    const user = new UserEntity(crypto.randomUUID(), email.value, name, passwordHash.hash);
    const saved = await this.userRepository.save(user);
    return this.toAuthUser(saved);
  }

  private toAuthUser(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
    };
  }
}
