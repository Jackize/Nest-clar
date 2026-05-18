import { DomainError } from '@/common/errors/domain.error';
import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    const success = await this.userRepository.delete(id);
    if (!success) {
      throw new DomainError('User not found', 'USER_NOT_FOUND');
    }
    return success;
  }
}
