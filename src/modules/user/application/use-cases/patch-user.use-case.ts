import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';

import { DomainError } from '@/common/errors/domain.error';
import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../user.di-token';

@Injectable()
export class PatchUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, input: Partial<UserEntity>): Promise<UserEntity> {
    const updatedUser = await this.userRepository.patch(id, input);
    if (!updatedUser) {
      throw new DomainError('User not found', 'USER_NOT_FOUND');
    }
    return updatedUser;
  }
}
