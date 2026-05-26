import { DomainError } from '@/common/errors/domain.error';
import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GetAllUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(page: number, limit: number, sortOrder: 'asc' | 'desc'): Promise<UserEntity[]> {
    const users = await this.userRepository.findAll(page, limit, sortOrder);
    if (!users) {
      throw new DomainError('No users found', 'NO_USERS_FOUND');
    }
    return users;
  }
}
