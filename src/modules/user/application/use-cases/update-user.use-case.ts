import { DomainError } from '@/common/errors/domain.error';
import { UserEntity } from '@/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@/modules/user/user.di-token';
import { Inject, Injectable } from '@nestjs/common';

type UpdateUserInput = {
  email: string;
  name: string;
};

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, input: UpdateUserInput): Promise<UserEntity> {
    const newInformationUser = new UserEntity(
      id,
      input.email.trim(),
      input.name.trim().toLowerCase(),
    );
    const updatedUser = await this.userRepository.update(
      id,
      newInformationUser,
    );
    if (!updatedUser) {
      throw new DomainError('User not found', 'USER_NOT_FOUND');
    }
    return updatedUser;
  }
}
