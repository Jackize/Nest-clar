import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain.error';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new DomainError('User not found', 404);
    }
    return user;
  }
}
